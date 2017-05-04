# Article Templates for Mobile Apps
Article templates used within the Guardian’s next-generation iOS, Android and Windows applications. This repo also contains documentation that describes the components and layouts used across these templates.

## Requirements
* A Mac or Linux computer.
* [brew](http://brew.sh/) as a package manager.
* [NVM](https://github.com/creationix/nvm).
* [NodeJS](http://nodejs.org/). Install using nvm: `nvm install v6.9.2`. Remember to add `nvm use v6.9.2` to your preferred shell startup file.
* [Yarn](https://yarnpkg.com). Yarn is a package manager. Install using `brew install yarn`.
* It is recommended you restart your shell to ensure changes added the startup file are applied.

## Usage
* checkout the project in a separate directory, outside the iOS and the Android app.
* run `yarn`.
* copy config.sample.js to config.js and fill in the details
    * `base.android` is the 'ArticleTemplate' path within the Android app, eg: `/Users/sandropaganotti/Projects/android-news-app/android-news-app/src/main/assets/templates/`
    * `base.ios` is the 'ArticleTemplate' path within the iOS app, eg: `/Users/sandropaganotti/Projects/ios-live/mobile-apps-article-templates/ArticleTemplates/`
    * `base.html` is the path where this repository has been checked out, eg: `/Users/sandropaganotti/Projects/mobile-apps-article-templates/`
* run `grunt`

## Yarn scripts
Yarn will provide the following services:

* `yarn test` it runs the unit test pack from the test/spec/unit/ directory
* `yarn validate` it launches the SASS syntax checker against our codebase and it performs a syntax checking on the current JS codebase
* `yarn buildJS` concatenate and minify javascript files, check javascript syntax, and start karma unit test runner
* `yarn buildCSS` run scsslint, compile SCSS into CSS and minify CSS.
* `yarn build` runs buildJS and buildCSS
* `yarn sync` it copies the folder `ArticleTemplates` to the iOS and Android project as specified on `base.ios` and `base.html`
* `yarn watch` on changes to CSS/JS run build and sync
* `yarn develop` runs build and watch