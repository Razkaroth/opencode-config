# User Interaction

Use `question` and `submit_plan` as the two primary user-feedback tools.

## `question`
- Use for sequential clarification.
- Prefer one question at a time.
- Batch only when items are tightly related and easier to answer together.
- For match/choice problems, use `question` to resolve the ambiguity first.

## `submit_plan`
- Use for long reports, draft reviews, and any response with multiple code samples or revision-friendly content.
- Use it when the user needs to inspect, compare, or revise information visually.
- Do not force it for short updates; standard chat is fine.

## `submit_plan` report shape
Prefill sections when possible.

- `Summary`
- `Details`
- `Recommendation` (optional)
- `Questions` (optional)

Omit `Recommendation` when the task is pure information gathering.
Omit `Questions` when no user input is needed.

## Examples
- `/to-issues`: present draft issues in `submit_plan`, with issue blocks in `Details`.
- Ambiguous factory lookup: use `question` first to identify the correct match, then send `submit_plan` without a `Questions` section.

## End-of-session boilerplate
When a `submit_plan` session ends, the platform may emit a follow-up like `Begin implementation`.
Treat that as boilerplate when the prior `submit_plan` was a report, draft, review, or other non-implementation message.
Ignore it unless the prior context explicitly asked to proceed with implementation.
