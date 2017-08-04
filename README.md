# Article Templates for Mobile Apps
[![cicle ci badge](https://circleci.com/gh/guardian/mobile-apps-article-templates/tree/master.svg?style=shield)](https://circleci.com/gh/guardian/mobile-apps-article-templates) [![npm version](https://badge.fury.io/js/%40guardian%2Fmobile-apps-article-templates.svg)](https://badge.fury.io/js/%40guardian%2Fmobile-apps-article-templates)

Article templates used within the Guardian’s next-generation iOS, Android and Windows applications. This repo also contains documentation that describes the components and layouts used across these templates.

## Requirements
* A Mac or Linux computer.
* [brew](http://brew.sh/) as a package manager.
* [NVM](https://github.com/creationix/nvm).
* [NodeJS](http://nodejs.org/). Install using nvm: `nvm install v6.9.2`. Remember to add `nvm use v6.9.2` to your preferred shell startup file.
* [Yarn](https://yarnpkg.com). Yarn is a package manager. Install using `brew install yarn`.
* It is recommended you restart your shell to ensure changes added the startup file are applied.

## Developing
* checkout the project in a separate directory, outside the iOS and the Android app.
* copy config.sample.js to config.js and fill in the details
    * `base.android` is the 'ArticleTemplate' path within the Android app, eg: `/Users/sandropaganotti/Projects/android-news-app/android-news-app/src/main/assets/templates/`
    * `base.html` is the path where this repository has been checked out, eg: `/Users/sandropaganotti/Projects/mobile-apps-article-templates/`
* run `yarn` to install dependencies.
* run `yarn setup` to locally ignore build files so they are not checked into master

## IOS and Android devs
If you are developing against a branch which is not `release`, please follow the steps below:

* Pull down the branch which you are developing against
* Follow the 'requirements' and 'developing' steps outlined above

## IOS devs
* run `yarn build` 
* Within the root of ios-live open the package.json and update the dependency "@guardian/mobile-apps-article-templates" to point towards "file:../mobile-apps-article-templates"
* next time you build using xcode it will use your local version of mobile-apps-article-templates

## Android devs
* run `yarn sync` which will build the project, and move the build into the Android

## Yarn scripts
Yarn will provide the following services:

* `yarn test` runs the JS unit tests from the test/spec/unit/ directory
* `yarn validate` runs sasslint checks on SCSS and jshint checks on JS
* `yarn build` builds JS/CSS assets, used on CI environment for building assets
* `yarn develop` builds JS and CSS (with source maps) assets and watches for changes to JS/CSS. If changes then rebuilds and copies assets to the Android project as specified in config.js

## deploying

[How to deploy](docs/how-to-deploy.md)
