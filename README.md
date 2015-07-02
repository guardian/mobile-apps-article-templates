# Article Templates for Mobile Apps
Article templates used within the Guardian’s next-generation iOS and Android applications. This repo also contains documentation that describes the components and layouts used across these templates.

## Requirements
* A Mac or Linux PC.
* [brew](http://brew.sh/) as a package manager.
* [rbenv](https://github.com/sstephenson/rbenv). Install it using brew `brew install rbenv ruby-build`. Remember to add `eval "$(rbenv init -)"` to `~/.profile`.
* [NVM](https://github.com/creationix/nvm). 
* [NodeJS](http://nodejs.org/). Install using nvm: `nvm install v0.12.5`. Remember to add `nvm use v0.12.5` to `~/.profile`.
* [Grunt](http://gruntjs.com/). Install using `npm install -g grunt grunt-cli`.
* ImageMagick and PhantomJS. Install using brew: `brew install phantomjs imagemagick`.

## Usage
* checkout the project in a separate directory, outside the iOs and the Android app.
* run `rbenv install && gem install bundler && source ~/.profile`.
* run `npm install`. 
* run `bundle install`.
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

## Grunt tasks
Grunt will provide the following services:
* `grunt rsync` it copies the folder `ArticleTemplates` to the iOs and Android project as specified on `base.ios` and `base.html`.
* `grunt sass` it generated the CSS files from SASS.
* `grunt scsslint` it launches the SASS syntax checker against our codebase.
* `grunt hologram` it generates/updates the visual styleguide. To see the guide `grunt express watch` and then point your browser to [localhost:3000](http://localhost:3000).
* `grunt jshint` it performs a syntax checking on the current js codebase.
* `grunt mocha:dev` it runs the tests on PhantomJS. The tests can be also run by loading directly the [runner.html](http://localhost:3000/root/test/unit/runner.html) page in a web browser.
* `grunt mocha:jenkins` it runs the tests on PhantomJS using the XML export.
* `grunt shell:android --card=1234` it generates a `android-news-app-debug.apk` file using the current project files. The `card` parameter is used to specificy the jira card number, so if the ticket is `AND-1234` card is equal to `1234`. This command only works if the Android SDK is installed and `adb` is in `PATH`.
* `grunt shell:ios` it generates a `guardian-debug.ipa` file using the current project files. This command only works if XCode is installed and `ios.sign` and `ios.provisioning` have been filled.
* `grunt shell:timeline --fixture=filename --times=20` it launches a telemetry session on file `filename` repeated `times` times. See the `Experimental performance measurement` section for more information.
* `grunt shell:wraithhistory` it setup a [wraith](https://github.com/BBC-News/wraith) session for visual regression testing. See the `Visual Regression` section for more information.
* `grunt shell:wraith` it launches a wraith session for visual regression testing. Results can be found pointing the browser to [localhost:3000](localhost:3000/root/test/visual/shots/gallery.html).

These services are also available packed into recipes
* `grunt build --sentry` concatenate and minify javascript files, check javascript syntax, check scss syntax, generate css files. Use the `--sentry` flag if you want the resulting files to include the websentry integration. It uses the value of `sentry.dsn`.
* `grunt apk --card=1234` it launches `build` then `rsync` and then `shell:android` to make sure that the resulting build contains the current files from the project and not some stale files.  
* `grunt ipa` it launches `build` then `rsync` and then `shell:ios`.
* `grunt installer --card=1234` it launches `apk` and `ipa` in sequence.
* `grunt test` it launches `build` and then all the test using `mocha`.

_By simply running `grunt` (without any argument) the system runs the server, then it keeps watching for changes reacting with the appropriate tasks._

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
When everything is properly configured type `grunt installer --card 123` to create a debuggable APK and IPA in the root folder of the project. Replace `123` with the number of a relevant Jira card for this build, as it will be appended to the version number in the app for reference.
