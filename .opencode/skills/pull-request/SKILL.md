---
name: pull-request
description: Guides preparing and opening a GitHub pull request with `gh pr create`, including branch checks, commit summarization, and sharing the resulting URL.
allowed-tools:
  - bash
metadata:
  category: workflow
  priority: high
---

1. Ensure you are not on `main` and base refs are up to date:
   - `git status -sb` to confirm the current branch.
   - `git fetch origin main` and `git merge-base --is-ancestor origin/main HEAD` to prove your work builds on the latest main.
2. Compare your branch to `origin/main` so you can write a clear title/body:
   - `git log --oneline origin/main..HEAD` shows the commit messages, `git diff --stat origin/main..HEAD` summarizes the file-level changes, and captured notes become the PR narrative.
3. Sculpt the pull request metadata:
   - Run `gh pr create --fill` to seed a draft title/body, then override those values with `--title`/`--body` once you are happy with the wording.
   - Collect reviewers, labels, or issue links from the branch context and append them with `--reviewer`, `--label`, or `Fixes #123` lines in the description.
4. Create the PR targeting `main`:
   - `gh pr create --base main --head "$(git symbolic-ref --short HEAD)" --title "<TITLE>" --body "<BODY>"`.
   - Add `--draft` / `--no-maintainer-edit` / `--project` / `--milestone` as needed; pass `--web` if you prefer the browser flow.
5. Capture the URL printed by `gh pr create` and relay it to the user so reviewers and release managers can follow along.
6. Do not push additional commits through this workflow and never include files under `reference/` in the pull request.

# Docs

```bash
❯ gh pr create --help
```

- `--head` accepts `<user>:<branch>` to select a forked head; organizations are not yet supported.
- `--fill` auto-generates title/body from commits, but explicit `--title`/`--body` override those values.
- `--base` sets the merge target; absent that flag, Git reads `branch.<current>.gh-merge-base` or falls back to the repo default.
- Referencing `Fixes #123` or `Closes #123` in the body auto-closes the issue once the PR merges.
- Add `--no-maintainer-edit` to prevent maintainers from pushing to your head branch.
- Assign projects or milestones with `--project`/`--milestone`; they may require `project` scope authorization via `gh auth refresh -s project`.
- Use `--web` to drop into the browser rather than providing CLI answers interactively.

IMPORTANT: Never push more commits as part of this workflow and never add files under `reference/` to the pull request.
