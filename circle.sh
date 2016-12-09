#!/bin/sh

git status
git log -1
git config --global user.name "GuardianAndroid"
git config --global user.email "guardian.android@gmail.com"
git config --global push.default simple
git commit -a -m "Generate files for release [skip ci]"
git checkout master
git fetch
git reset --hard origin/master
git log -1
git merge release
git push origin master
git push origin release