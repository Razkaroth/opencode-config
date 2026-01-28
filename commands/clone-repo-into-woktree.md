---
description: Clone a repo into worktree layout (bare + gh)
agent: build
---

You are tasked with cloning a GitHub repo using the `gh` tool and setting it up in the worktree workspace layout.

Protocol:

1. Resolve context:
   - Ask for the GitHub repo (OWNER/REPO or URL) and the target parent directory.
   - Determine `repo_name` from the repo slug.
   - If the target `<repo_name>/` already exists, ask before proceeding.

2. Bare clone with gh:
   - Use `gh repo clone <repo> <repo_name>.git -- --bare` in the target parent directory.
   - If gh auth is required, instruct the user to run `gh auth login` and retry.

3. Create workspace layout:
   - Create `<repo_name>/` and move `<repo_name>.git` to `<repo_name>/.git`.
   - Do not run a regular `git clone`. Use only the bare repo you just created.

4. Prefix and secrets:
   - If beads is available, use it to determine the project prefix.
   - Otherwise, derive a prefix from `repo_name` by first splitting on spaces (if present) or on hyphens (if there are no spaces) and concatenating the first letters of each segment. Keep the result lowercase, truncate to 4 letters if needed, and write it to `<repo_name>/.prefix`. If no spaces or hyphens exist, fall back to taking the first up to 4 lowercase ASCII letters of the name.

5. Branch setup:
   - Detect whether `main` or `master` exists in the bare repo.
   - Ensure a `dev` branch exists; if not, create it from `main` or `master`.
   - Create worktrees for `dev/` and for the default branch (`main/` or `master/`) as siblings under `<repo_name>/`.
   - Ensure the worktree folder names are exactly `dev` and `main`/`master` (no prefix).

6. Feature worktrees:
   - List branches (exclude `beads-sync`).
   - Ask which branches to create worktrees for.
   - Map each selected branch to `<prefix>-<kind>-<featureName>` using the same inference rules as @commands/worktree-migrate.md.
   - If a selected branch only exists on the remote, create a local tracking branch before adding the worktree.
   - Create feature worktrees as siblings of `dev/`.
   - If a target folder already exists, skip and report.

Return a concise summary of actions taken (clone path, moved git dir, created branches, created worktrees, skipped items).
