---
description: Update .envrc for worktree layout and propagate
agent: build
---

You are tasked with updating a repo's `.envrc` to work with the new worktree layout, then propagating the change across branches.

Requirements:
- Create a new `.envrc` template compatible with the worktree layout.
- Apply the update on the `dev` branch worktree; if it does not exist, use `main` or `master`.
- Commit the `.envrc` change using the `(kind): desc` convention.
- Cherry-pick that commit to all other branches (exclude `beads-sync`).
- Never push.
- Do not include any files under `reference/`.

Template to use for `.envrc` (replace the file content):

```bash
use flake .

# Repo/worktree context
WORKTREE_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
if [[ -z "$WORKTREE_ROOT" ]]; then
  log_error "git root not found"
  exit 1
fi
REPO_ROOT=$(dirname "$WORKTREE_ROOT")
REPO_NAME=$(basename "$REPO_ROOT")
WORKTREE_ID=$(basename "$WORKTREE_ROOT")

# Secret discovery with find_up
SECRETS_FILE=$(find_up .secrets.env)
if [[ ! -f "$SECRETS_FILE" ]]; then
  SECRETS_FILE=$(find_up secrets.env)
fi
if [[ -f "$SECRETS_FILE" ]]; then
  dotenv "$SECRETS_FILE"
else
  log_error "secrets env not found in current or parent directories"
  exit 1
fi

# Port offset calculation
PORT_OFFSET=0
if [[ "$WORKTREE_ID" != "dev" && "$WORKTREE_ID" != "main" && "$WORKTREE_ID" != "master" ]]; then
  PORT_OFFSET=$(echo -n "$WORKTREE_ID" | cksum | cut -d' ' -f1)
  PORT_OFFSET=$((PORT_OFFSET % 50 + 1))
fi
export COMPOSE_PROJECT_NAME="${REPO_NAME}_${WORKTREE_ID}"

# Export all port variables
export APP_PORT=$((3000 + PORT_OFFSET))
export MONGO_PORT=$((27017 + PORT_OFFSET))
export MINIO_PORT=$((9000 + PORT_OFFSET))
export MINIO_CONSOLE_PORT=$((9001 + PORT_OFFSET))
export MINIO_TEST_PORT=$((9002 + PORT_OFFSET))
export MINIO_TEST_CONSOLE_PORT=$((9003 + PORT_OFFSET))
export STORYBOOK_PORT=$((6006 + PORT_OFFSET))
export PLAYWRIGHT_PORT=$((8008 + PORT_OFFSET))
export EMAIL_PORT=$((3001 + PORT_OFFSET))

# Database
export DATABASE_MONGODB_URI="mongodb://localhost:${MONGO_PORT}/nordic-starter"

# S3/MinIO
export S3_ACCESS_KEY_ID=minio
export S3_ENDPOINT="http://localhost:${MINIO_PORT}"
export S3_REGION=us-east-1
export S3_BUCKET=forge

# Clerk
export CLERK_JWT_ISSUER_DOMAIN=https://<your-clerk-domain>.accounts.dev
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_<your-publishable-key>
export NEXT_PUBLIC_CLERK_SIGN_IN_URL=/acceso
export NEXT_PUBLIC_CLERK_SIGN_UP_URL=/acceso

# Stripe
export NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_<your-stripe-publishable-key>

# Email
export SMTP_HOST=smtp.ethereal.email
export SMTP_PORT=587
export SMTP_USER=dorcas31@ethereal.email
export EMAIL_FROM_ADDRESS=dorcas31@ethereal.email
export EMAIL_FROM_NAME=Nordic Studio

# Next.js
export NEXT_PUBLIC_SERVER_URL="http://localhost:${APP_PORT}"

# Convex
export CONVEX_DEPLOYMENT=anonymous:anonymous-starter
export NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210

# Developer
export DEVELOPER=raz
```

Before applying the template, inspect the current `.envrc` (or one from another worktree) and copy over any real values for the placeholder fields such as the Clerk domain, publishable keys, and Stripe key so the migration preserves secrets. Only leave `<your-...>` placeholders when a value is intentionally cleared or missing.

Execution steps:
1. Locate the repo root and worktree layout. Determine whether `dev` exists; otherwise use `main` or `master`.
2. Update `.envrc` in that worktree using the template above.
3. Commit the change with a `(kind): desc` message (include details in the body).
4. List all branches, exclude `beads-sync`, and cherry-pick the commit onto every other branch.
   - If a branch only exists on the remote, create a local tracking branch first.
   - If a branch does not have a worktree yet, create one following the worktree naming rules, then cherry-pick there.
5. Report a concise summary (branches updated, worktrees created, any skips).
