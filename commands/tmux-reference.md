---
description: Add a reference tmux window
agent: build
---
You are tasked with adding a reference window to the 'reference' tmux session.

1.  **Identify Context**:
    *   Get the current working directory.
    *   Extract the *parent* folder name (e.g., if current is `/a/b/c`, parent is `b`). **Wait**, user said "name of the parent folder". Usually "parent folder of current directory" means `..`. But often users mean "the name of the current project folder". Let's stick to the prompt: "name of the parent folder". If I am in `/home/user/project/src`, parent is `project`. If I am in `/home/user/project`, parent is `user`.
    *   *Self-Correction*: "parent folder" usually implies the folder *containing* the current one. However, if I am at the root of a repo, naming it after the repo folder (current) makes more sense. Let's look at the user prompt: "append a window to the 'reference' session with the name of the parent folder."
    *   Let's assume the user means "the name of the directory I am currently in" or "the name of the directory above me". "Parent folder" strongly suggests `basename $(dirname $PWD)`.
    *   *Alternative interpretation*: The user considers the *current* folder as the item, so its "name" is the label. But they said "name of the parent folder". I will interpret this literally: `basename $(dirname $(pwd))`.
    *   Actually, let's look at the use case. "write important information". If I am deep in `docs/plans`, maybe I want a window named `plans` (current) or `docs` (parent)?
    *   Let's check the user prompt again: "append a window ... with the name of the parent folder."
    *   I will verify this behavior with a quick shell command in the prompt to be safe, or just provide the logic to the agent. "Get the name of the immediate parent directory of the current working directory."

2.  **Session Management**:
    *   Check if tmux session `reference` exists. Create if missing.

3.  **Window Management**:
    *   Check if a window named `<parent_folder_name>` exists in `reference`.
    *   If no, create it: `tmux new-window -t reference -n <name> -c <current_dir>`.
    *   If yes, switch to it or do nothing (idempotent).

4.  **Output**:
    *   Confirm the action.
