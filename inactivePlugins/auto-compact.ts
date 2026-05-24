import type { Plugin, PluginInput } from "@opencode-ai/plugin"
import { parse, type ParseError } from "jsonc-parser"

declare const Bun: {
  file(path: string): {
    text(): Promise<string>
  }
}

declare const process: {
  env: {
    HOME?: string
  }
}

const TOKEN_THRESHOLD = 100_000
const COMPACTION_TIMEOUT_MS = 2 * 60 * 1000
const COOLDOWN_MS = 5 * 60 * 1000
const MAX_ERROR_MESSAGE_LENGTH = 120
const CONFIG_PATH = `${process.env.HOME ?? ""}/.config/opencode/compacter.jsonc`

type EventInput = {
  event: {
    type: string
    properties?: unknown
  }
}

type MessageInfo = {
  sessionID?: string
  role?: string
  summary?: boolean
  providerID?: string
  modelID?: string
  mode?: string
  agent?: string
  tokens?: {
    input?: number
    cache?: {
      read?: number
    }
  }
}

type PendingCompaction = {
  resolve: () => void
  reject: (error: Error) => void
  timeoutID: ReturnType<typeof setTimeout>
}

type AutoCompactState = {
  inProgress: Set<string>
  pending: Map<string, PendingCompaction>
  lastCompactedAt: Map<string, number>
}

type CompacterConfig = {
  excludedModels: Set<string>
  excludedAgents: Set<string>
}

export const AutoCompactPlugin: Plugin = async (ctx) => {
  const config = await loadCompacterConfig(ctx)
  const state: AutoCompactState = {
    inProgress: new Set(),
    pending: new Map(),
    lastCompactedAt: new Map(),
  }

  return {
    "experimental.compaction.autocontinue": async (_input, output) => {
      output.enabled = true
    },
    event: async ({ event }: EventInput) => {
      const properties = event.properties as Record<string, unknown> | undefined

      if (event.type === "session.deleted") {
        const info = properties?.info as { id?: string } | undefined
        if (info?.id) clearSessionState(state, info.id)
        return
      }

      if (event.type === "session.compacted") {
        const sessionID = properties?.sessionID as string | undefined
        if (sessionID) resolvePending(state, sessionID)
        return
      }

      if (event.type !== "message.updated") return

      const info = properties?.info as MessageInfo | undefined
      if (!info?.sessionID || info.role !== "assistant") return

      if (info.summary === true) {
        resolvePending(state, info.sessionID)
        return
      }

      const modelKey = info.providerID && info.modelID ? `${info.providerID}/${info.modelID}` : "unknown"
      await ctx.client.app
        .log({
          body: {
            service: "auto-compact",
            level: "debug",
            message: "message.updated",
            extra: {
              modelKey,
              agent: info.agent ?? "none",
              mode: info.mode ?? "none",
              tokens: getUsedTokens(info),
              excludedModel: config.excludedModels.has(modelKey),
              excludedAgent: info.agent ? config.excludedAgents.has(info.agent) : false,
            },
          },
        })
        .catch(() => {})

      if (!shouldCompact(state, config, info)) return

      void compactSession(ctx, state, info)
    },
  }
}

export default AutoCompactPlugin

function shouldCompact(state: AutoCompactState, config: CompacterConfig, info: MessageInfo): boolean {
  const sessionID = info.sessionID
  if (!sessionID) return false
  if (!info.providerID || !info.modelID) return false
  if (config.excludedModels.has(getModelKey(info))) return false
  if (info.agent && config.excludedAgents.has(info.agent)) return false
  if (state.inProgress.has(sessionID) || state.pending.has(sessionID)) return false

  const tokens = getUsedTokens(info)
  if (tokens <= TOKEN_THRESHOLD) return false

  const lastCompactedAt = state.lastCompactedAt.get(sessionID) ?? 0
  return Date.now() - lastCompactedAt >= COOLDOWN_MS
}

function getUsedTokens(info: MessageInfo): number {
  return (info.tokens?.input ?? 0) + (info.tokens?.cache?.read ?? 0)
}

function getModelKey(info: MessageInfo): string {
  return `${info.providerID}/${info.modelID}`
}

async function loadCompacterConfig(ctx: PluginInput): Promise<CompacterConfig> {
  try {
    const source = await Bun.file(CONFIG_PATH).text()
    const errors: ParseError[] = []
    const parsed = parse(source, errors, { allowTrailingComma: true }) as {
      excludedModels?: unknown
      excludedAgents?: unknown
    }
    if (errors.length > 0) throw new Error(`Invalid JSONC: ${errors.map((error) => error.error).join(", ")}`)

    return {
      excludedModels: toStringSet(parsed.excludedModels),
      excludedAgents: toStringSet(parsed.excludedAgents),
    }
  } catch (error) {
    if (isMissingFileError(error)) return emptyConfig()

    await ctx.client.app
      .log({
        body: {
          service: "auto-compact",
          level: "warn",
          message: "Failed to load compacter config",
          extra: { path: CONFIG_PATH, error: getErrorMessage(error) },
        },
      })
      .catch(() => {})

    return emptyConfig()
  }
}

function toStringSet(value: unknown): Set<string> {
  if (!Array.isArray(value)) return new Set()
  return new Set(value.filter((item): item is string => typeof item === "string"))
}

function emptyConfig(): CompacterConfig {
  return {
    excludedModels: new Set(),
    excludedAgents: new Set(),
  }
}

function isMissingFileError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT"
}

async function compactSession(ctx: PluginInput, state: AutoCompactState, info: MessageInfo): Promise<void> {
  const sessionID = info.sessionID
  const providerID = info.providerID
  const modelID = info.modelID
  if (!sessionID || !providerID || !modelID) return

  state.inProgress.add(sessionID)

  try {
    await showToast(ctx, "Auto Compacting", `Context passed ${TOKEN_THRESHOLD.toLocaleString()} tokens. Summarizing...`, "warning")

    const compaction = waitForSummary(state, sessionID)

    await ctx.client.session.summarize({
      path: { id: sessionID },
      body: { providerID, modelID },
      query: { directory: ctx.directory },
    })

    await compaction
    state.lastCompactedAt.set(sessionID, Date.now())

    await showToast(ctx, "Compaction Complete", "Session summarized.", "success")
  } catch (error) {
    clearPending(state, sessionID)
    await showToast(ctx, "Compaction Failed", getErrorMessage(error), "error")
  } finally {
    state.inProgress.delete(sessionID)
  }
}

function waitForSummary(state: AutoCompactState, sessionID: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutID = setTimeout(() => {
      state.pending.delete(sessionID)
      reject(new Error("Compaction timed out"))
    }, COMPACTION_TIMEOUT_MS)

    state.pending.set(sessionID, { resolve, reject, timeoutID })
  })
}

function resolvePending(state: AutoCompactState, sessionID: string): void {
  const pending = state.pending.get(sessionID)
  if (!pending) return

  clearTimeout(pending.timeoutID)
  state.pending.delete(sessionID)
  pending.resolve()
}

function clearPending(state: AutoCompactState, sessionID: string): void {
  const pending = state.pending.get(sessionID)
  if (!pending) return

  clearTimeout(pending.timeoutID)
  state.pending.delete(sessionID)
}

function clearSessionState(state: AutoCompactState, sessionID: string): void {
  const pending = state.pending.get(sessionID)
  if (pending) {
    clearTimeout(pending.timeoutID)
    pending.reject(new Error("Session deleted"))
  }

  state.pending.delete(sessionID)
  state.inProgress.delete(sessionID)
  state.lastCompactedAt.delete(sessionID)
}

async function showToast(
  ctx: PluginInput,
  title: string,
  message: string,
  variant: "success" | "warning" | "error",
): Promise<void> {
  await ctx.client.tui
    .showToast({
      body: {
        title,
        message,
        variant,
      },
    })
    .catch(() => {
      // Toasts are best-effort; compaction should not fail if UI notification fails.
    })
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, MAX_ERROR_MESSAGE_LENGTH)
  return String(error).slice(0, MAX_ERROR_MESSAGE_LENGTH)
}
