---
description: Bootstrap main project tmux session
agent: build
---

You are tasked with bootstrapping the main tmux session for the current project.

1. **Session Setup**:
   - If a .prefix file is present in this directory or the parent directory, use that for the session name.
   - If no such file:
     - Find the git remote of the current directory and extract the repo name from it.
     - As fallback, list current tmux sessions and ask the user to select one or provide a new name.
   - Ensure a tmux session with this name exists.

2. **Standard Windows**:
   - Ensure the following windows exist (create if missing):
     - `coding`
     - `command`
     - `server`
   - Use the git root as the working directory for these windows.

3. **Worktree Integration**:
   - List active git worktrees (`git worktree list`).
   - For each worktree found:
     - Skip if the path includes `beads-sync`.
     - Get the branch name associated with the worktree.
     - Check if a window named `<branch_name>` exists in the session.
     - If not, create it, setting the working directory to the worktree root.

4. **Summary**:
   - List the session name and all current windows.
