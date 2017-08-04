#!/bin/bash -xe

npm --no-git-tag-version version patch
PACKAGE_VERSION=$(node -p "require('./package.json').version")
npm publish --access public
git clone git@github.com:guardian/ios-live.git
cd ios-live
jq ".dependencies[\"@guardian/mobile-apps-article-templates\"] = \"${PACKAGE_VERSION}\"" package.json > tmp
mv tmp package.json
git add package.json
git commit -m "$(printf "Update to mobile-apps-article-templates version $PACKAGE_VERSION")"
git push origin master
cd ..
git clone -b npm-templates git@github.com:guardian/android-news-app.git
cd android-news-app
jq ".dependencies[\"@guardian/mobile-apps-article-templates\"] = \"${PACKAGE_VERSION}\"" package.json > tmp
mv tmp package.json
git add package.json
git commit -m "$(printf "Update to mobile-apps-article-templates version $PACKAGE_VERSION")"
git push origin npm-templates
