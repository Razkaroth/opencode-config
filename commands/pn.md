---
description: Research and present the answer to a question or investigation via the plan UI, enabling richer reading and easy follow-up feedback.
---

The user invoked `/pn` with the following request:

<request>
$ARGUMENTS
</request>

Your job is to fully research and answer this request, then present the result exclusively via the `submit_plan` tool — not as a chat message.

## Steps

1. Do whatever work is needed to answer the request (run commands, read files, search the codebase, etc.).
2. Compose the answer as well-structured markdown: use headers, bullet points, tables, and code blocks as appropriate for the content. Optimise for readability, not brevity — the plan UI renders markdown and the user will read it comfortably there.
3. Call `submit_plan` with the composed markdown as the `plan` argument.

## Output format guidelines

- Lead with a one-sentence summary of what the answer covers.
- Use `##` sections to separate distinct aspects of the answer.
- For comparisons (e.g. diff between commits, before/after): use a table or side-by-side sections.
- For lists of changes or findings: use bullet points with a short bold label followed by detail.
- Include code blocks with language tags for any code, commands, or diffs.
- End with a `## Notes` section if there are caveats, assumptions, or follow-up suggestions worth flagging.

## Important

- Do NOT write the answer as a chat response. The only output to the user is via `submit_plan`.
- Do NOT truncate or summarise aggressively — the plan UI is designed for rich content. Give the full answer.
- If the request is ambiguous, make a reasonable interpretation and note it in the `## Notes` section rather than asking upfront.

## After the user responds to the plan

The plan UI has no explicit cancel button. Interpret the user's response as follows:

- **Approved with no global comment** → session ends. Do nothing. The user has acknowledged the content and is done.
- **Approved with a global comment requesting code changes** → proceed with the changes described in the comment.
- **Approved with a global comment asking a follow-up question** → answer via a new `submit_plan` call.
