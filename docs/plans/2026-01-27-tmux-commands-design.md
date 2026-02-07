<section name="problem">
Create two opencode commands to bootstrap tmux workflows: `/tmux-reference` should append a window named after the parent folder to the persistent ``reference`` session, while `/tmux-main` must ensure a session named after the git root exists with core windows for coding, command, and server work plus additional windows for each active git worktree (excluding ``beads-sync``).
</section>
<section name="findings">
- <span scope="main_session_config">The `/tmux-main` command should derive the session name from the git root, ensure the ``coding``, ``command``, and ``server`` windows exist, and initialize them with empty shells to keep the setup idempotent.</span>
- <span scope="reference_logic">The `/tmux-reference` command targets the existing ``reference`` session and appends a window named after the parent directory, reusing sessions/windows when present so it behaves deterministically.</span>
- <span scope="worktree_integration">After setting up the core windows, `/tmux-main` must detect every active git worktree (excluding any named ``beads-sync``) and add a window named for each worktree's branch, with its cwd at the worktree root and an interactive shell.</span>
</section>
<section name="recommendation">
Implement each command as a standalone opencode action that uses tmux control-mode: `/tmux-reference` should check for a ``reference`` session and append the parent-folder window if missing, and `/tmux-main` should derive the session name from the git root, ensure the three base windows exist, and then iterate the git worktrees (excluding ``beads-sync``) to create branch-named windows. Ensure each step validates session/window existence so repeated invocations are safe.
</section>
