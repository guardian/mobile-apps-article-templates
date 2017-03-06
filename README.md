# Article Templates for Mobile Apps
Article templates used within the Guardian’s next-generation iOS and Android applications. This repo also contains documentation that describes the components and layouts used across these templates.

## Requirements
* A Mac or Linux PC.
* [brew](http://brew.sh/) as a package manager.
* [NVM](https://github.com/creationix/nvm).
* [NodeJS](http://nodejs.org/). Install using nvm: `nvm install v6.9.2`. Remember to add `nvm use v6.9.2` to your preferred shell startup file.
* [Grunt](http://gruntjs.com/). Install using `npm install -g grunt grunt-cli`.
* It is recommended you restart your shell to ensure changes added the startup file are applied.

## Usage
* checkout the project in a separate directory, outside the iOS and the Android app.
* run `npm install`.
* copy config.sample.js to config.js and fill in the details
    * `base.android` is the 'ArticleTemplate' path within the Android app, eg: `/Users/sandropaganotti/Projects/android-news-app/android-news-app/src/main/assets/templates/`
    * `base.ios` is the 'ArticleTemplate' path within the iOs app, eg: `/Users/sandropaganotti/Projects/ios-live/mobile-apps-article-templates/ArticleTemplates/`
    * `base.html` is the path where this repository has been checked out, eg: `/Users/sandropaganotti/Projects/mobile-apps-article-templates/`
* run `grunt`

## Grunt tasks
Grunt will provide the following services:

* `grunt rsync` it copies the folder `ArticleTemplates` to the iOs and Android project as specified on `base.ios` and `base.html`.
* `grunt sass` it generated the CSS files from SASS.
* `grunt sasslint` it launches the SASS syntax checker against our codebase.
* `grunt jshint` it performs a syntax checking on the current js codebase.
* `grunt karma` it runs the unit test pack from the test/spec/unit/ directory

These services are also available packed into recipes
* `grunt build` runs buildJS and buildCSS
* `grunt buildJS` concatenate and minify javascript files, check javascript syntax, and start karma unit test runner.
* `grunt buildCSS` run scsslint, compile SCSS into CSS and minify CSS.

By simply running `grunt` (without any argument) the system keeps watching for changes reacting with the appropriate tasks.