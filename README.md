# Article Templates for Mobile Apps
[![cicle ci badge](https://circleci.com/gh/guardian/mobile-apps-article-templates/tree/master.svg?style=shield)](https://circleci.com/gh/guardian/mobile-apps-article-templates) [![npm version](https://badge.fury.io/js/%40guardian%2Fmobile-apps-article-templates.svg)](https://badge.fury.io/js/%40guardian%2Fmobile-apps-article-templates)

Article templates used within the Guardian’s next-generation iOS, Android and Windows applications. This repo also 
contains documentation that describes the components and layouts used across these templates.

## Requirements
* A Mac or Linux computer.
* [brew](https://brew.sh/) as a package manager.
* [NVM](https://github.com/creationix/nvm).
* [NodeJS](https://nodejs.org/). Install using nvm: `nvm install v6.9.2`. Remember to add `nvm use v6.9.2` to your 
preferred shell startup file.
* [Yarn](https://yarnpkg.com). Yarn is a package manager. Install using `brew install yarn`.
* It is recommended you restart your shell to ensure changes added the startup file are applied.

## Developing
**Clone**
```bash
$ git clone git@github.com:guardian/mobile-apps-article-templates.git
```

**Install**
```bash
$ yarn
```

**Watch**
```bash
$ yarn develop
```

## Mobile apps developers
If you are developing against a branch of `mobile-apps-article-templates` which is not `master`:

* Checkout the branch you are developing against
* Run `yarn build`
* Edit the `package.json` file in the root of `ios-live` /`android-news-app`, replacing the version of the `@guardian/mobile-apps-article-templates` dependency with the relative path of the local templates repo, e.g. (if your repositories are in the same folder):
```
"dependencies": {
    "@guardian/mobile-apps-article-templates": "file:../mobile-apps-article-templates"
}
```

Next time you build the app it will use the currently checked-out branch of `mobile-apps-article-templates`

## Yarn scripts
Yarn will provide the following services:

* `yarn test` runs the JS unit tests from the `test/spec/unit/` directory
* `yarn validate` runs `sasslint` checks on SCSS and `jshint` checks on JS
* `yarn build` builds JS/CSS assets, used on CI environment for building assets
* `yarn develop` builds JS and CSS (with source maps) assets and watches for changes to JS/CSS. On change, it rebuilds
assets and source maps
