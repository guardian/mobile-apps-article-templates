#!/bin/bash -xe
REPO_NAME=$1
PACKAGE_VERSION=$2
BRANCH=$3
GIT_ASKPASS=./git-auth-helper.sh

TMP=`mktemp -d`
pushd $TMP

echo "Cloning ${REPO_NAME}"
git clone https://GuardianAndroid@github.com/guardian/${REPO_NAME}.git

cd ${REPO_NAME}
echo "Updating templates to ${PACKAGE_VERSION}"
jq ".dependencies[\"@guardian/mobile-apps-article-templates\"] = \"${PACKAGE_VERSION}\"" package.json > tmp
mv tmp package.json
git add package.json
git commit -m "$(printf "Update to mobile-apps-article-templates version $PACKAGE_VERSION")"
git push origin $BRANCH
echo "Pushed to git."
popd
rm -rf $TMP
echo "Cleaned temp dir"