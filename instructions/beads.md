# Beads Issue Tracker

This project uses **beads (bd)** for dependency-aware issue tracking. Issues are chained together like beads, with first-class dependency support.

## Quick Reference

```bash
bd ready                   # Find unblocked work (no blockers, open/in_progress)
bd create "Title"          # Create a new issue
bd close <id>              # Complete an issue
bd sync                    # Sync with git (run at session end)
```

## Core Workflow

### Finding Work

```bash
bd ready                   # Show issues ready to work on
bd ready --limit 5         # Limit results
bd list --status open      # List open issues
bd list --status blocked   # List blocked issues
bd show <id>               # Show issue details with dependencies
```

### Creating Issues

```bash
bd create "Fix login bug"
bd create "Add auth" --priority 0 --type feature
bd create "Write tests" --description "Unit tests for auth" --assignee alice
```

**Issue Types:** `bug`, `feature`, `task`, `epic`, `chore`

**Priority Levels:** 0 (highest) to 4 (lowest)

### Managing Dependencies

```bash
bd dep add <issue> <blocker>   # Add dependency (blocker blocks issue)
bd dep tree <id>               # Visualize dependency tree
bd blocked                     # Show all blocked issues
```

**Dependency Types:**
- `blocks` - Hard blocker, must complete first
- `related` - Soft link, informational only
- `parent-child` - Epic/subtask hierarchy
- `discovered-from` - Found during work on another issue

### Updating Issues

```bash
bd update <id> --status in_progress   # Claim work
bd update <id> --status blocked       # Mark as blocked
bd update <id> --priority 0           # Change priority
bd update <id> --assignee <name>      # Assign to someone
```

**Status Values:** `open`, `in_progress`, `blocked`, `deferred`, `closed`

### Closing Issues

```bash
bd close <id>                          # Complete an issue
bd close <id> --reason "Fixed in PR"   # With reason
bd close <id1> <id2> <id3>             # Close multiple
```

## Agent Guidelines

### Before Starting Work

1. Run `bd ready` to find unblocked issues
2. Use `bd show <id>` to understand requirements and dependencies
3. Update status: `bd update <id> --status in_progress`

### During Work

- If you discover new work, create an issue: `bd create "Found: ..." --type task`
- If blocked by another issue: `bd dep add <your-issue> <blocker>`
- Update progress in issue description if needed

### After Completing Work

1. Close the issue: `bd close <id>`
2. Run `bd sync` to sync with git
3. Check `bd ready` for next available work

### Creating Good Issues

Include when relevant:
- Clear, actionable title
- Description with context
- Acceptance criteria
- Dependencies on other issues
- Appropriate priority (0=urgent, 2=normal, 4=low)

### Discovering Dependencies

When you find that work depends on something else:
```bash
bd create "Prerequisite work" --type task
bd dep add <current-issue> <prerequisite-issue>
```

This marks your current issue as blocked until the prerequisite is done.

## Database & Sync

- Database location: `.beads/*.db`
- JSONL backup: `.beads/issues.jsonl`
- Auto-sync with git via hooks (if installed)
- Manual sync: `bd sync`

## Useful Commands

```bash
bd status                  # Overview and statistics
bd doctor                  # Health check
bd graph                   # Dependency graph visualization
bd prime                   # Full workflow context (this content)
bd hooks list              # Check git hooks status
```

## MCP Integration

If beads MCP tools are available, prefer using them directly:
- `beads_ready` - Find unblocked work
- `beads_list` - List issues with filters
- `beads_show` - Show issue details
- `beads_create` - Create new issues
- `beads_update` - Update issues
- `beads_close` - Complete issues
- `beads_dep` - Manage dependencies
- `beads_blocked` - Show blocked issues
- `beads_stats` - Database statistics

Set workspace context first: `beads_context` with `workspace_root` pointing to the repo.
