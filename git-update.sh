#!/bin/sh

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
  $UPDATE_DEPTH = $2
fi

# Functions

check_upstream() {
  # https://stackoverflow.com/a/3278427
  local LOCAL=$(git rev-parse @)
  local REMOTE=$(git rev-parse "$1")
  local BASE=$(git merge-base @ "$1")
  if [ $LOCAL = $REMOTE ]; then
    echo "${GREEN} Local clone up-to-date${DEFAULT}"
  elif [ $LOCAL = $BASE ]; then
    echo "${RED} Need to pull before commit${DEFAULT}"
    exit 1
  elif [ $REMOTE = $BASE ]; then
    echo "${YELLOW} Local clone has unpushed commits${DEFAULT}"
  else
    echo "${RED} Diverged${DEFAULT}"
    exit 1
  fi
}

check() {
  if local branch=$(git symbolic-ref --short -q HEAD); then
    echo "${RED} >>> On branch $branch <<<${DEFAULT}"
    check_upstream "$branch"
  else
    printf "${RED}\n>>>\nNOT ON ANY BRANCH\n>>>\n\n${DEFAULT}"
    exit 1
  fi
}

update_threshold() {
  printf "${GREEN}\n>>> UPDATING THRESHOLD\n\n${DEFAULT}"
  cd docs/threshold/threshold

  check

  # git status
  git add -A
  git commit -m "threshold: $1"
  git push
  cd ../../..
}

update_threshold_scientist() {
  printf "${GREEN}\n>>> UPDATING THRESHOLD SCIENTIST\n\n${DEFAULT}"
  cd docs/threshold

  check

  # git status
  git add -A
  git commit -m "threshold-scientist: $1"
  git push
  cd ../..
}

update_website() {
  printf "${GREEN}\n>>> UPDATING WEBSITE\n\n${DEFAULT}"
  check
  # git status
  git add -A
  git commit -m "website: $1"
  git push
}

#

if [ $UPDATE_DEPTH = "1" ]; then
  echo "${YELLOW}>>> Update threshold-scientist AND website"
  update_threshold_scientist "$1"
  update_website "$1"

elif [ $UPDATE_DEPTH = "0" ]; then
  echo "${YELLOW}>>> Update ONLY website"
  update_website "$1"

elif [ $UPDATE_DEPTH = "2" ]; then
  echo "${YELLOW}>>> Update threshold AND threshold-scientist AND website"
  update_threshold "$1"
  update_threshold_scientist "$1"
  update_website "$1"
fi
