# Article Templates for Mobile Apps
Article templates used within the Guardian’s next-generation iOS and Android applications. This repo also contains documentation that describes the components and layouts used across these templates.

## Requirements
* A Mac or Linux PC
* Ruby >= v1.9.x. You may already have this, but run `ruby -v` to check which version you have installed.
* [Bundler](http://bundler.io). Install using `gem install bundler`.
* [NodeJS](http://nodejs.org/). Install following the instructions from the website or with [NVM](https://github.com/creationix/nvm).
* [Grunt](http://gruntjs.com/). Install using `npm install -g grunt grunt-cli`.

## Usage
* checkout the project in a separate directory, outside the iOs and the Android app.
* run `npm install` 
* copy config.sample.js to config.js and fill in the details
* run `grunt develop` 

Grunt will provide the following services:
* sass linting and compilation
* javascript linting and minification
* rsync with both the iOs and the Android local codebase.

## Updating the Documentation
Documentation is built locally, to rebuild the documentation just type: `grunt hologram`

Documentation is also available on the web at: http://guardian.github.io/mobile-apps-article-templates/, which displays the static files stored in the gh-pages branch. To update this publically viewable site with your latest changes, run the following commands:

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

## APKs 
When everything is properly configured type `grunt build` to create in the root folder of the project the debuggable APK.