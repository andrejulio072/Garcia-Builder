#!/usr/bin/env bash
set -Eeuo pipefail

# Push the current local branch to the Garcia Builder GitHub main branch.
# Override GITHUB_REPO_URL if the repository is moved or a different auth URL is needed.
readonly DEFAULT_REPO_URL="https://github.com/andrejulio072/Garcia-Builder.git"
readonly REPO_URL="${GITHUB_REPO_URL:-$DEFAULT_REPO_URL}"
readonly TARGET_BRANCH="${TARGET_BRANCH:-main}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: this script must be run inside a Git repository." >&2
  exit 1
fi

current_branch="$(git branch --show-current)"
if [[ -z "$current_branch" ]]; then
  echo "Error: detached HEAD. Check out a branch before pushing." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: working tree has uncommitted changes. Commit or stash them before pushing." >&2
  git status --short >&2
  exit 1
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi

echo "Origin: $(git remote get-url origin)"
echo "Pushing ${current_branch} to origin/${TARGET_BRANCH}..."
git push -u origin "${current_branch}:${TARGET_BRANCH}"
