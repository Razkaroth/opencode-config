# Rules for code finding and exploration

Context pollution is an issue in medium to large codebases.
You are equipped with the explorer subagent to deal with this issue.
Whenever tasked with finding a piece of code, patterns, etc.:

- Do not attempt to search yourself by reading files at random. This will pollute your context and waste tokens.
- Spawn explorer subagents to explore the codebase and find what you need.
- Give the explorer explicit instructions on what to find and exactly what to return.

# Deliveries from explorer

Always specify a concrete, structured deliverable. Vague asks produce unreliable results.

Good delivery specs:
- "Return the absolute file path and line number where `FooClass` is defined."
- "Return a list of files that import from `@/lib/auth`, with the import line for each."
- "Return 2-3 representative code samples showing how database queries are structured, with file paths."

Bad delivery specs:
- "Tell me about the auth system."
- "Explore how routing works."

# On the explorer capabilities and limitations

The explorer runs on **gpt-5-mini**, a fast model optimized for well-defined, precise tasks.
Performance degrades significantly with open-ended, broad, or ambiguous instructions.

Key constraints:
- Not a general-purpose reasoning agent.
- Context gets polluted quickly when reading many files.
- Accuracy drops sharply when given broad or multi-part instructions.
- Requires explicit, narrow scope to produce reliable results.
- Prone to missing or fabricating information when overloaded.

# How to structure explorer tasks

**One goal per explorer.** Each explorer invocation should have a single, unambiguous objective.

**Be explicit about scope.** Tell the explorer exactly where to look if you know (e.g., "search only in `src/components/`").

**Name the tools to use.** gpt-5-mini tends to skip tools unless explicitly told to use them. Specify the tool in your instruction (e.g., "use Glob to find files matching `**/*.ts`, then use Grep to search for `FooClass`").

**Specify the output format.** Tell the explorer how to structure its response (file path + line, code snippet, list, etc.).

**Chain explorers for complex tasks.** Break multi-step exploration into sequential or parallel stages:

Example — understanding a package:
- Explorer 1: "Find the root directory of the `payments` package. Return the absolute path."
- Explorer 2: "List all files in `<path from explorer 1>` and their top-level exports."
- Explorer 3: "Find all files outside the package that import from it. Return file paths only."
- Explorer 4+: "Return the implementation of `chargeCard` in `<file>`. Return the function body and its line range."

Avoid giving a single explorer the job that belongs to four.
