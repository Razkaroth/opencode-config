---
description: Turn free-form ideas into a td epic plan
agent: plan
argument-hint: "[epic-id] <free-form plan request>"
---

You are translating free-form ideas into an actionable execution plan in the `td` task manager.

Hard rule: do not make any write/update call to `td` until you submit a draft with the `submit_plan` tool.

Workflow:

1. Parse intent and epic target
   - Use user arguments and request context as the source of truth.
   - If an epic ID is provided, treat this as an update to that existing epic.
   - If no epic ID is provided, assume all work will live under a single defined epic and create/select that epic during execution.

2. Build an actionable breakdown proposal
   - Decompose the work into concrete `td` issues under the epic.
   - Each issue must include:
     - A clear, action-oriented title.
     - A description that states both:
       - what to do
       - how to do it (implementation approach, key steps, constraints)
     - Completion requirements (definition of done / acceptance criteria).
   - Define dependencies and blockers between issues.
   - Keep scope realistic and ordered for execution.

3. Submit the draft proposal first (required gate)
   - Call `submit_plan` with:
     - `summary`: concise overview of the proposed epic breakdown.
     - `plan`: structured plan containing epic decision, issue list, dependencies/blockers, and completion requirements.
   - Wait for user review/approval feedback before making any `td` mutations.

4. Apply to `td` after draft approval
   - Create or update the epic.
   - Create/update child issues under that epic.
   - Configure dependency and blocker links.
   - Ensure each issue includes explicit completion requirements.

5. Return execution summary
   - Report epic ID, created/updated issue IDs, dependency links, and any assumptions made.
   - If anything could not be applied, report exactly what remains and why.

Output quality bar:
- Prefer specific, implementation-ready issues over generic planning notes.
- Capture enough detail that an engineer can execute without re-planning.
- Keep titles short and descriptions practical.
