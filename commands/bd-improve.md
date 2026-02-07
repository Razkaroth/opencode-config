---
description: Improve the beads entry
agent: build
---

You will recieve an id or query text as well as an optional instruction to explore.

-If an id is given: Use the id to find the entry in the codebase.
-If a query text is given: Use the query text to find the entry in the codebase. If only one entry is found, use that entry. If multiple entries are found, ask the user to choose one.

1. Get the details of the beads entry.
   2a. If the explore instruction is given, gather enough context from the codebase to have a plan.
   2b. If the explore instruction is not given, the user has deemed the task to be simple enough to not require exploration. In this case, you should simply create a more thorough description based on what the entry already had.
2. Update the beads with an improved title and description.
