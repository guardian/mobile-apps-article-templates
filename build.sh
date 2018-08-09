#!/bin/bash -xe

yarn 
yarn build
yarn validate
yarn test
yarn pack
ls
echo "//registry.npmjs.org/:_authToken=$NODE_TOKEN" >> ~/.npmrc
echo "Would do a release to npm here."

# ./update.sh ios-live 1.0.${BUILD_NUMBER} ${BRANCH_NAME}
# ./update.sh android-news-app 1.0.${BUILD_NUMBER} ${BRANCH_NAME}
