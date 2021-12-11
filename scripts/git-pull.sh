#!/bin/sh

DEFAULT=$(tput setaf 7)
YELLOW=$(tput setaf 3)

# cd docs/threshold/threshold/psychojs
cd docs/threshold/threshold

# echo "${YELLOW}Pulling psychojs${DEFAULT}"
# git pull --rebase # psychojs

cd ..
echo "${YELLOW}Pulling threshold${DEFAULT}"
git pull origin # threshold

cd ..
echo "${YELLOW}Pulling threshold-scientist${DEFAULT}"
git pull origin # threshold-scientist

cd ..
echo "${YELLOW}Pulling website${DEFAULT}"
git pull origin # website
