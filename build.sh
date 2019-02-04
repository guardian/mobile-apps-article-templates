#!/bin/bash -xe

# Build
npm install
npm run build
npm run test

# Publish
echo "//registry.npmjs.org/:_authToken=$NODE_TOKEN" >> ~/.npmrc
npm --no-git-tag-version version 1.0.${BUILD_NUMBER}
npm publish --access public
