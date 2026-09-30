#!/bin/sh

set -e

DEFAULT=$(tput setaf 7)
RED=$(tput setaf 1)
YELLOW=$(tput setaf 3)

REPOS="docs/experiment/threshold/psychojs docs/experiment/threshold docs/experiment ."

# jj insurance: snapshot the working copy into jj's op log before pulling,
# so a git accident stays recoverable (jj op log / jj --at-op). Fires only
# where the repo is jj-colocated; a no-op for everyone else.
if command -v jj >/dev/null 2>&1; then
  for repo in $REPOS; do
    [ -d "$repo/.jj" ] && (cd "$repo" && jj st >/dev/null 2>&1) || true
  done
fi

# Never pull over modified tracked files: a rebase would have to stash them,
# and a stash pop can silently merge stale content into the tree. Fail
# loudly, before touching any repo. Untracked files are safe (pull never
# touches them) but worth surfacing.
preflight_repo() {
  if ! git -C "$1" diff --quiet || ! git -C "$1" diff --cached --quiet; then
    echo "${RED}>>> Uncommitted changes in $1 — commit (or deliberately stash) before pulling${DEFAULT}"
    git -C "$1" status -sb | head -20
    exit 1
  fi
  untracked=$(git -C "$1" status --porcelain | grep '^??' || true)
  if [ -n "$untracked" ]; then
    echo "${YELLOW}>>> Untracked files in $1 (pull won't touch them):${DEFAULT}"
    echo "$untracked" | head -10
  fi
}

for repo in $REPOS; do
  preflight_repo "$repo"
done

# -c rebase.autoStash=false: never autostash, whatever the local config —
# a dirty tree must abort the pull loudly, never round-trip through a stash.
echo "${YELLOW}Pulling psychojs${DEFAULT}"
git -C docs/experiment/threshold/psychojs -c rebase.autoStash=false pull --rebase

echo "${YELLOW}Pulling threshold${DEFAULT}"
git -C docs/experiment/threshold -c rebase.autoStash=false pull --rebase

echo "${YELLOW}Pulling threshold-scientist${DEFAULT}"
git -C docs/experiment -c rebase.autoStash=false pull --rebase

echo "${YELLOW}Pulling website${DEFAULT}"
git -c rebase.autoStash=false pull --rebase
