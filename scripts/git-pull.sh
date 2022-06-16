#!/bin/sh

DEFAULT=$(tput setaf 7)
YELLOW=$(tput setaf 3)

# cd docs/experiment/threshold
cd docs/experiment/threshold/psychojs

echo "${YELLOW}Pulling psychojs${DEFAULT}"
git pull --rebase # psychojs
cd ..

echo "${YELLOW}Pulling threshold${DEFAULT}"
git pull --rebase # threshold
cd ..

echo "${YELLOW}Pulling threshold-scientist${DEFAULT}"
git pull --rebase # threshold-scientist
cd ..

echo "${YELLOW}Pulling website${DEFAULT}"
git pull --rebase # website
