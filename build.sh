#!/bin/bash -xe

# Build
yarn 
yarn build
yarn validate
yarn test

# Publish
echo "//registry.npmjs.org/:_authToken=$NODE_TOKEN" >> ~/.npmrc
npm --no-git-tag-version version 1.0.${BUILD_NUMBER}
npm publish --access public
