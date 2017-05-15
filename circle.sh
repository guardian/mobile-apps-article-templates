#!/bin/bash -xe

# check if there are changes
if [[ `git status --porcelain` ]]; then
    git status
    git log -1
    git config --global user.name "GuardianAndroid"
    git config --global user.email "guardian.android@gmail.com"
    git config --global push.default simple
    git status
    git add .
    git status
    git commit -m "Generate files for release [skip ci]"
    git checkout release
    git reset --hard origin/release
    git merge master -m "Merge master into release"
    git log -1
    git push origin release
fi
