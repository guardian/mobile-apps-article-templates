# Article Templates for Mobile Apps
Article templates used within the Guardian’s next-generation iOS and Android applications. This repo also contains documentation that describes the components and layouts used across these templates.

## Requirements
* A Mac or Linux PC
* Ruby >= v1.9.x. You may already have this, but run `ruby -v` to check which version you have installed. It is strongly suggested to use a Ruby Virtualizer (like [rbenv](https://github.com/sstephenson/rbenv), to avoid using sudo every time).
* [Bundler](http://bundler.io). Install using `gem install bundler`.
* [NodeJS](http://nodejs.org/). Install following the instructions from the website or with [NVM](https://github.com/creationix/nvm).
* [Grunt](http://gruntjs.com/). Install using `npm install -g grunt grunt-cli`.
* ImageMagick and PhantomJS, the best way to install these is through [brew](http://brew.sh/): `brew install phantomjs imagemagick`

## Usage
* checkout the project in a separate directory, outside the iOs and the Android app.
* run `npm install` 
* run `bundle install`
* copy config.sample.js to config.js and fill in the details
    * `base.android` is the 'ArticleTemplate' path within the Android app, eg: `'/Users/sandropaganotti/Projects/guardian-app/android-news-app/android-news-app/src/debug/assets/templatesSubmodule/ArticleTemplates/'`
    * `base.ios` is the 'ArticleTemplate' path within the iOs app, eg: `/Users/sandropaganotti/Projects/guardian-app/ios-live/mobile-apps-article-templates/ArticleTemplates/`
    * `base.html` is the path where this repository has been checked out, eg: `/Users/sandropaganotti/Projects/guardian-app/html-webview/`
    * `performance.server` is the URL that points to your local machine, you can use `http://127.0.0.1` temporarily but you'll need to switch it to the LAN IP if you want to use the performance testing on an external device.
    * `ios.sign` and `ios.provisioning`. This is more tricky, these two values can be extracted following this procedure:
        * from a terminal go to the folder `GLA` within the `ios-live` repository
        * run `xcodebuild build -sdk iphoneos8.3 -configuration Debug -workspace GLA.xcworkspace -scheme GLADebug`
        * read the (very long) output log, at the end there are two rows `Signing Identity:` and `Provisioning Profile:`
        * use the value of `Signing Identity:` for `ios.sign`
        * look on your hard drive for a file named after the `Provisioning Profile:` - the part between the brakets, eg: if your `Provisioning Profile:` value is (`123456-3136-4783-95e8-ac71ca306f46`) you need to look for a file named `123456-3136-4783-95e8-ac71ca306f46.mobileprovision` eg: `/Users/sandropaganotti/Library/MobileDevice/Provisioning Profiles/123456-3136-4783-95e8-ac71ca306f46.mobileprovision` and use that path for the `ios.provisioning`
    * `sentry.dsn` go to the Sentry [configuration page](https://app.getsentry.com/docs/platforms/javascript/?pid=40557) - be sure to be logged in on Sentry - and copy the value from the example code that starts with `Raven.config(...`. Eg: with `Raveg.config('1234')` `sentry.dsn = '1234'`
* run `grunt` 

Grunt will provide the following services:
* sass linting and compilation
* javascript linting and minification
* rsync with both the iOs and the Android local codebase.

## Experimental performance measurement
This feature allows us to record several timelines from a page loaded into the device and then it extracts some 
particular features (such as frame rate, page load time and more) and it creates a chart for it. 
To use this feature there are a few steps involved:
* make sure your device can reach your laptop over LAN and fill the `performance.server` field in `config.js` with your laptop LAN address (eg: `http://192.168.1.1`)
* connect your device over USB and open chrome
* collect the page you want to test under test/fixture folder and be sure to add the session name to each page. Session names should be used during measurements to describe the device used and any other extra features, e.g.
```bash
<!--
article1_s3_nocss
-->
```
* run `grunt`
* in a separate shell run `grunt shell:timeline --fixture=article1.html --times=10` where article1.html is the name of the fixture you want to load and 10 is the number of timelines you want to record
* head to http://localhost:3000/performances/#yoursession to see the results
* individual timelines are also recorded under `/Performance/timelines` and CSVs of each session under `/Performance/session`

## Visual Regressions
Use this feature to check for CSS regressions:
* install imagemagick and phantomjs (eg: `brew install phantomjs imagemagick`)
* run `grunt`
* in a separate shell run `grunt shell:wraithhistory` from the project root to collect baseline screenshots
* when you're ready run `grunt shell:wraith` from the project root to take a new set of screenshots and compare the with the baseline
* browse http://localhost:3000/root/test/visual/shots/gallery.html to see the differences between the to sets of shots

## Updating the Documentation
Documentation is built locally, to rebuild the documentation just type: `grunt hologram`

Documentation is also available on the web at: http://guardian.github.io/mobile-apps-article-templates/, which displays the static files stored in the gh-pages branch. To update this publicly viewable site with your latest changes, run the following commands:

```bash
$ git commit -am "Commit message"
$ git checkout gh-pages
$ git merge master
$ git push origin master gh-pages
```

Alternatively, you can set up your local git repository to automatically push changes to both master and gh-pages branches. Simply add the following 2 lines to the ``[remote "origin"]`` section of ``.git/config``:

```
push = +refs/heads/master:refs/heads/gh-pages
push = +refs/heads/master:refs/heads/master
```

## Error monitoring system
This project uses Sentry to monitor errors and failures. Sentry can be configured by adding the appropriate dsn in the config.js file (have a look at config.sample.js for reference). Sentry is disabled by default, in order not to be used during debugging sessions. To enable it use the --sentry flag while building. (eg: `grunt build --sentry`).

## APKs and IPAs
When everything is properly configured type `grunt installer` to create in the root folder of the project the debuggable APK and IPA.
