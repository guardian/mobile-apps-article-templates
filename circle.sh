#!/bin/bash -xe

git status
git log -1
git config --global user.name "GuardianAndroid"
git config --global user.email "guardian.android@gmail.com"
git config --global push.default simple
git status
npm --no-git-tag-version version patch
git add package.json
PACKAGE_VERSION=$(node -p "require('./package.json').version")
git commit -m "$(printf "Update to version $PACKAGE_VERSION  [skip ci]")"
git push origin master
npm publish --access public
git clone git@github.com:guardian/ios-live.git
cd ios-live
jq ".dependencies[\"@guardian/mobile-apps-article-templates\"] = \"${PACKAGE_VERSION}\"" package.json > tmp
mv tmp package.json
git add package.json
git commit -m "$(printf "Update to mobile-apps-article-templates version $PACKAGE_VERSION")"
git push origin master
cd ..
git clone git@github.com:guardian/android-news-app.git
cd android-news-app
jq ".dependencies[\"@guardian/mobile-apps-article-templates\"] = \"${PACKAGE_VERSION}\"" package.json > tmp
mv tmp package.json
git add package.json
git commit -m "$(printf "Update to mobile-apps-article-templates version $PACKAGE_VERSION")"
git push origin master
