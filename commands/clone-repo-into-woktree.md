---
description: Clone a repo into worktree layout (prefix folder + gh)
agent: build
---

You are tasked with cloning a GitHub repo using the `gh` tool and setting it up in the worktree workspace layout.

Protocol:

1. Resolve context:
   - Ask for the GitHub repo (OWNER/REPO or URL) and the target parent directory.
   - Determine `repo_name` from the repo slug.
   - Ask whether you should use a prefix or the repo_name should be used. If the user provides one, use it verbatim (no transformations).
   - If the target `<repo_name/prefix>/` already exists, ask before proceeding.

2. Clone default branch into dev:
   - Identify the default branch via `gh repo view <repo> --json defaultBranchRef --jq .defaultBranchRef.name`.
   - Create the folder structure `<repo_name|prefix>/` and `<repo_name|prefix>/dev/`.
   - Run a normal clone of the default branch into `<repo_name|prefix>/dev/` using `gh repo clone`.
   - Do not use bare repositories.

3. Worktree safety:
   - From this point on, run all git commands with `workdir` set to `<repo_name|prefix>/dev`.
   - Do not run any git commands from outside the `dev` worktree to avoid conflicts.
   - Do not add or remove remotes.

4. Prefix persistence:
   - Write the prefix to `<repo_name|prefix>/.prefix`.
   - If the file already exists and differs, stop and ask before overwriting.

5. Branch setup:
   - List all branches (local + remote) and exclude `beads-sync`.
   - Ask which non-default branches should get worktrees.
   - If a selected branch exists only on the remote, create a local tracking branch before adding the worktree.

6. Worktree layout:
   - Create worktrees as siblings of `dev/` inside `<repo_name|prefix>/`.
   - Each worktree folder name must match its branch name exactly (no renames, no extra prefixes).
   - If a target folder already exists, skip and report.

Return a concise summary of actions taken (clone path, prefix used, default branch, created worktrees, skipped items).
