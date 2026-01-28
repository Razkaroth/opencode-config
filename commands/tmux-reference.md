---
description: Add a reference tmux window
agent: build
---

You are tasked with adding a reference window to the `reference` tmux session.

1. **Identify Context**:
    - Set `project_name` to the immediate parent directory name of the current working directory (i.e., `basename $(dirname "$(pwd)")`).
    - When working under standard config paths such as `~/.config` or `~/.local`, prefer the first subfolder beneath `.config`/`.local` so that `~/.config/nvim` produces `nvim`, even if the CWD is deeper.
    - Examples:
      - `/home/raz/project` → `project`
      - `/home/raz/project/src` → `project`
      - `/tmp/foo/bar` → `foo`
      - `/home/raz/.config/opencode` → `.config`
      - `/home/raz/.config/nvim` → `nvim`
      - `/home/raz/.config/hypr/shaders` → `hypr`

2. **Session Management**:
    - Create the `reference` session if it does not already exist.

3. **Window Management**:
    - If `reference` already has a window named `project_name`, skip creation.
    - Otherwise, create a new window named `project_name` and set its working directory to the current directory.

4. **Output**:
    - Return a short summary indicating whether the window was created or already existed.
