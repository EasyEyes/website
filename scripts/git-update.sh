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
  UPDATE_DEPTH=$2
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
  cd docs/experiment/threshold

  check

  # Check for undefined i18n phrases before proceeding
  npm run analyze:phrases
  if [ $? -ne 0 ]; then
    echo "\033[31mERROR: Undefined i18n phrases found. Commit aborted.\033[0m"
    exit 1
  fi

  # git status
  git add -A
  git commit -m "$2: $1"
  git push
  cd ../../..
}

update_threshold_scientist() {
  printf "${GREEN}\n>>> UPDATING THRESHOLD SCIENTIST\n\n${DEFAULT}"
  cd docs/experiment

  check

  # git status
  git add -A
  git commit -m "$2: $1"
  git push
  cd ../..
}

update_website() {
  printf "${GREEN}\n>>> UPDATING WEBSITE\n\n${DEFAULT}"
  check
  # git status
  git add -A
  git commit -m "$2: $1"
  git push
}

#

if [ $UPDATE_DEPTH = "1" ]; then
  echo "${YELLOW}>>> Update threshold-scientist AND website"
  update_threshold_scientist "$1" "for threshold-scientist"
  update_website "$1" "for threshold-scientist"

elif [ $UPDATE_DEPTH = "0" ]; then
  echo "${YELLOW}>>> Update ONLY website"
  update_website "$1" "for website"

elif [ $UPDATE_DEPTH = "2" ]; then
  echo "${YELLOW}>>> Update threshold AND threshold-scientist AND website"
  update_threshold "$1" "for threshold"
  update_threshold_scientist "$1" "for threshold"
  update_website "$1" "for threshold"
fi
