#!/bin/bash -xe

# Build
yarn 
yarn build
yarn test

# Set release version in Sentry
sed -i -e "s/__LOCAL_RELEASE__/$BUILD_NUMBER/g" ArticleTemplates/assets/build/common.js

# Publish
echo "//registry.npmjs.org/:_authToken=$NODE_TOKEN" >> ~/.npmrc
npm --no-git-tag-version version 1.0.${BUILD_NUMBER}
npm publish --access public
