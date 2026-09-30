#!/bin/sh

set -e

DEFAULT=$(tput setaf 7)
RED=$(tput setaf 1)
GREEN=$(tput setaf 2)
YELLOW=$(tput setaf 3)

# $1

if [ $# -eq 0 ]; then
  printf "${RED}\n>>>\nYOU MUST PUT AT LEAST ONE ARGUMENT - COMMIT MESSAGE\n>>>\n\n${DEFAULT}"
  exit 1
fi

# $2

unset UPDATE_DEPTH
: ${UPDATE_DEPTH:=1}

if [ $2 ]; then
  UPDATE_DEPTH=$2
fi

# Functions

check() {
  if local branch=$(git symbolic-ref --short -q HEAD); then
    echo "${RED} >>> On branch $branch <<<${DEFAULT}"
  else
    printf "${RED}\n>>>\nNOT ON ANY BRANCH\n>>>\n\n${DEFAULT}"
    exit 1
  fi
}

# Commit first, then rebase onto origin, then push: with the tree clean
# post-commit the rebase needs no autostash (forbidden anyway), so the
# common "I have changes and origin moved" case just works. A genuine
# conflict stops the script with the repo mid-rebase and recovery steps.
sync_with_origin() {
  if ! git rev-parse "@{u}" >/dev/null 2>&1; then
    echo "${RED}>>> No upstream configured for this branch${DEFAULT}"
    exit 1
  fi
  if ! git -c rebase.autoStash=false pull --rebase --quiet; then
    echo "${RED}>>> Rebase onto origin failed in $(pwd) — likely a conflict."
    echo "    Resolve: fix the files, git add, git rebase --continue"
    echo "    Or bail: git rebase --abort (your commit is safe), then re-run npm run git${DEFAULT}"
    exit 1
  fi
}

commit_if_changes() {
  git add -A
  if git diff --cached --quiet; then
    echo "${YELLOW} No staged changes, skipping commit${DEFAULT}"
  else
    git commit -m "$2: $1"
  fi
}

update_threshold() {
  printf "${GREEN}\n>>> UPDATING THRESHOLD\n\n${DEFAULT}"
  cd docs/experiment/threshold

  check

  commit_if_changes "$1" "$2"
  sync_with_origin
  git push
  cd ../../..
}

update_threshold_scientist() {
  printf "${GREEN}\n>>> UPDATING THRESHOLD SCIENTIST\n\n${DEFAULT}"
  cd docs/experiment

  check

  commit_if_changes "$1" "$2"
  sync_with_origin
  git push
  cd ../..
}

update_website() {
  printf "${GREEN}\n>>> UPDATING WEBSITE\n\n${DEFAULT}"
  check
  commit_if_changes "$1" "$2"
  sync_with_origin
  git push
}

# Repos involved in every deploy path; checked no matter the depth.
HYGIENE_REPOS="docs/experiment/threshold/psychojs docs/experiment/threshold docs/experiment ."

preflight_hygiene() {
  printf "${GREEN}\n>>> PRE-FLIGHT HYGIENE\n${DEFAULT}"
  # jj insurance: snapshot jj-colocated working copies into the op log
  # before committing, so a git accident stays recoverable. No-op elsewhere.
  if command -v jj >/dev/null 2>&1; then
    for repo in $HYGIENE_REPOS; do
      [ -d "$repo/.jj" ] && (cd "$repo" && jj st >/dev/null 2>&1) || true
    done
  fi
  for repo in $HYGIENE_REPOS; do
    # A repo left mid-rebase (e.g. an earlier conflict) must be finished
    # or aborted before anything else happens in it.
    git_dir=$(git -C "$repo" rev-parse --absolute-git-dir)
    if [ -d "$git_dir/rebase-merge" ] || [ -d "$git_dir/rebase-apply" ]; then
      echo "${RED}>>> $repo is mid-rebase — finish (git rebase --continue) or abort (git rebase --abort) first${DEFAULT}"
      exit 1
    fi
    # Leftover conflict markers must never reach a commit.
    if git -C "$repo" grep -q -e '^<<<<<<< ' -e '^>>>>>>> ' -- . ':!node_modules' 2>/dev/null; then
      echo "${RED}>>> Conflict markers in $repo:${DEFAULT}"
      git -C "$repo" grep -l -e '^<<<<<<< ' -- . ':!node_modules'
      exit 1
    fi
  done
  # Submodule coherence: after `git add -A`, threshold's psychojs pointer
  # becomes the submodule's HEAD — refuse to pin a commit nobody can fetch.
  if [ "$UPDATE_DEPTH" = "2" ]; then
    sub_head=$(git -C docs/experiment/threshold/psychojs rev-parse HEAD)
    if ! git -C docs/experiment/threshold/psychojs branch -r --contains "$sub_head" 2>/dev/null | grep -q threshold-prod; then
      echo "${RED}>>> psychojs HEAD $sub_head is not on origin/threshold-prod — merge+push psychojs first${DEFAULT}"
      exit 1
    fi
  fi
  printf "${GREEN} >>> hygiene OK${DEFAULT}\n"
}

preflight_typecheck() {
  printf "${GREEN}\n>>> PRE-FLIGHT TYPECHECK\n${DEFAULT}"
  if [ "$UPDATE_DEPTH" = "2" ]; then
    printf "${YELLOW} >>> threshold ${DEFAULT}\n"
    (cd docs/experiment/threshold && npm run check:ts)
  fi
  if [ "$UPDATE_DEPTH" = "1" ] || [ "$UPDATE_DEPTH" = "2" ]; then
    printf "${YELLOW} >>> threshold-scientist ${DEFAULT}\n"
    (cd docs/experiment && npm run check:ts)
  fi
  printf "${GREEN} >>> typecheck OK${DEFAULT}\n"
}

#

if [ $UPDATE_DEPTH = "1" ]; then
  echo "${YELLOW}>>> Update threshold-scientist AND website"
  preflight_hygiene
  preflight_typecheck
  update_threshold_scientist "$1" "for threshold-scientist"
  update_website "$1" "for threshold-scientist"

elif [ $UPDATE_DEPTH = "0" ]; then
  echo "${YELLOW}>>> Update ONLY website"
  preflight_hygiene
  update_website "$1" "for website"

elif [ $UPDATE_DEPTH = "2" ]; then
  echo "${YELLOW}>>> Update threshold AND threshold-scientist AND website"
  preflight_hygiene
  preflight_typecheck
  update_threshold "$1" "for threshold"
  update_threshold_scientist "$1" "for threshold"
  update_website "$1" "for threshold"
fi
