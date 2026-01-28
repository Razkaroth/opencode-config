---
description: Migrate a repo to worktree workspace layout
agent: build
---
You are tasked with migrating the current git repo into a workspace-style folder layout using git worktrees. Follow these steps carefully and keep the process safe and repeatable.

Target layout:
<repo-name>/
  - dev/                (dev branch)
  - main/ or master/    (main or master branch)
   - <prefix>-<kind>-<featureName>/   (feature worktrees, prefix lowercase)

Protocol:
1. Resolve context:
   - Determine the git root and `repo_name` (basename of the git root).
   - Ensure the working tree is clean. If not, ask the user whether to proceed or to commit/stash.

2. Move repo into workspace layout:
   - Rename the current repo directory to `<repo-name>.bak`.
   - Create a new `<repo-name>/` directory.
   - Move `<repo-name>.bak` into `<repo-name>/dev`.

3. Move git metadata to workspace root:
   - Move `<repo-name>/dev/.git` to `<repo-name>/.git`.
   - Create a `.git` file at `<repo-name>/dev/.git` that points to the new git dir using a relative `gitdir:` path.
   - If a worktree entry already exists elsewhere, relocate that worktree folder to match the desired `<repo-name>/<worktree>` structure and update the gitdir/worktree paths accordingly.

4. Secrets and prefix:
   - If `<repo-name>/dev/.secrets.env` exists, move it to `<repo-name>/.secrets.env`.
    - If beads is available, use it to determine the project prefix.
    - Otherwise, derive a prefix from `repo_name` by first splitting on spaces (if present) or on hyphens (if there are no spaces) and concatenating the first letters of each segment. Keep the result lowercase, truncate to 4 letters if needed, and write it to `<repo-name>/.prefix`. If no spaces or hyphens exist, fall back to taking the first up to 4 lowercase ASCII letters of the name.

5. Branch setup:
   - Check if a `dev` branch exists. If not, create it from `main` or `master`.
   - Always create a separate worktree for `main` or `master` (whichever exists) as a sibling of `dev/`.
   - Ensure `dev` and `main`/`master` worktree folders use their branch names only (no prefix).

6. Feature worktrees:
   - Use git to list branches.
   - Exclude `beads-sync`.
   - Ask the user which branches to create worktrees for (use the question tool if available).
   - Map each selected branch to a folder name in the form `<prefix>-<kind>-<featureName>`.
     - Infer `kind` from branch prefixes like `feat/`, `fix/`, `chore/`, `docs/`, `refactor/` when possible; ask the user if ambiguous.
   - Create worktrees as siblings of `dev/`.
   - If a worktree already exists for a target folder, skip it and report.

Examples:
- `feature/login` -> `acme-feat-login`
- `fix/crash` -> `acme-fix-crash`
- `chore/cleanup` -> `acme-chore-cleanup`

Return a concise summary of the actions taken (moves, created branches, created worktrees, skipped items).
