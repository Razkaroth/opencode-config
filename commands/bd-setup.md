---
description: Initialize beads issue tracker in the current repository
---

Automatically set up the beads (bd) issue tracker in the current repository with minimal user intervention.

## Steps

1. **Check if beads is already initialized**
   - Run `bd info` to check if a `.beads/` directory already exists
   - If already initialized, inform the user, run `bd doctor` to verify health, and exit

2. **Generate automatic prefix from repository/folder name**
   - Get the current directory name (e.g., "my-awesome-project")
   - Generate a 4-letter max acronym from the name:
     - Take first letter of each word (e.g., "my-awesome-project" → "map")
     - If single word, take first 4 letters (e.g., "opencode" → "open")
     - Convert to lowercase
   - Example: `basename $(pwd)` to get folder name

3. **Initialize beads with team workflow**
   - Run `bd init --prefix <GENERATED_PREFIX>`
   - This assumes team workflow with git tracking (not stealth mode)
   - Report the prefix being used

4. **Install git hooks for auto-sync**
   - Run `bd hooks install` to enable automatic synchronization
   - Hooks handle: pre-commit flush, post-merge import, pre-push validation

5. **Run test workflow to verify setup**
   - Create a parent test issue: `bd create "Test parent issue" --type task`
   - Capture the parent issue ID from output
   - Create a child test issue: `bd create "Test child issue" --type task`
   - Capture the child issue ID from output
   - Add dependency: `bd dep add <parent-id> <child-id> --type parent-child`
   - Update child to in_progress: `bd update <child-id> --status in_progress`
   - Close child: `bd close <child-id> --reason "Test complete"`
   - Close parent: `bd close <parent-id> --reason "Test complete"`
   - Delete both issues: `bd delete <parent-id> <child-id> --yes`
   - Confirm cleanup: `bd list` should show empty or no test issues

6. **Verify installation**
   - Run `bd doctor` to confirm everything is healthy
   - Show `bd status` to display the current state
   - Report success to user with the prefix used

7. **Setup AGENTS.md file**
   - Run `bd onboard` to get the recommended content
   - Check if `AGENTS.md` exists in the project root
   - If `AGENTS.md` exists:
     - Read the current content
     - Check if it already contains a beads/bd section
     - If no beads section exists, append the onboard content
     - If beads section exists, inform user it's already configured
   - If `AGENTS.md` doesn't exist:
     - Create new `AGENTS.md` with the onboard content
   - Report what was done (created vs updated)

8. **Summary**
   - Report that beads is initialized and ready
   - Show the prefix: "Beads initialized with prefix: <PREFIX>"
   - Remind user that git hooks are installed for auto-sync
   - Mention that AGENTS.md has been created/updated
   - Point user to run `bd prime` for full workflow context

## Prefix Generation Examples

- `my-awesome-project` → `map`
- `opencode` → `open`
- `react-native-app` → `rna`
- `api-gateway` → `ag`
- `frontend` → `fron`

## Key Commands Reference

```bash
bd init --prefix <PREFIX>  # Initialize with custom prefix
bd hooks install           # Install git hooks for auto-sync
bd onboard                 # Get AGENTS.md recommended content
bd doctor                  # Health check
bd status                  # Overview and statistics
bd prime                   # AI workflow context
```

## Notes

- The `bd` CLI must already be installed and on PATH
- Beads uses a `.beads/` directory with SQLite database and JSONL files
- Auto-sync keeps the database and JSONL in sync with git operations
- Test issues are created and deleted automatically to verify functionality
- AGENTS.md will be created or updated with beads workflow instructions
