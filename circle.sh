#!/bin/bash -xe

# check if there are changes
if [[ `git status --porcelain` ]]; then
  	git status
  	git log -1
  	git config --global user.name "GuardianAndroid"
  	git config --global user.email "guardian.android@gmail.com"
  	git config --global push.default simple
  	git commit -a -m "Generate files for release [skip ci]"
    git push origin master
    git checkout release
    git merge master
    git push origin release
fi
