# Article Templates for Mobile Apps
Article templates used within the Guardian’s next-generation iOS and Android applications. This repo also contains documentation that describes the components and layouts used across these templates.

## Requirements
* A Mac or Linux PC
* Ruby >= v1.9.x. You may already have this, but run `ruby -v` to check which version you have installed.
* [Bundler](http://bundler.io). Install using `gem install bundler`.

## Usage
Assuming you have checked out this project, open a console and change directory into the root of the project.

This project has two parts; the templates used by the applications (`/ArticleTemplates/`), and the documentation (built locally to `/Documentation/` from the files located in `/DocumentationTemplates/`).

To get started, run:

`bundle install`

to install Ruby dependancies. Then run:

`bundle exec guard`

This will start [Guard](https://github.com/guard/guard), which we use to run the following build tasks:

* Compile SCSS files for article templates
* Compile SCSS files for documentation
* Lint these SCSS files to ensure consistent code style. Linter rules are configured with [.scss-lint.yml](ArticleTemplates/assets/scss/.scss-lint.yml)
* Lint a JS file when modified using [JSLint On Rails](https://github.com/wireframe/guard-jslint-on-rails).
* Build documentation files. Documentation is built using [Hologram](https://github.com/trulia/hologram), and is configured with [hologram.yml](hologram.yml)

## Javascript concatenation and obfuscation

The templates now use a single JavaScript app.js file optimised with r.js and using RequireJS (AMD). There are three files in the new ArticlesTemplates/assets/build directory:

* build.js - the build script telling r.js the main config to build off
* r.js - the optimisation and concatenation tool
* app.js - the final output optimised/concatenated file used in the async call on each template page.

You will need NodeJS to run the build file, once Node is installed globally, run the following command in the directory:

`node r.js -o build.js`

For debugging switch the data-main attribute source in the script async tag at the base of the template you wish to test from
data-main="__TEMPLATES_DIRECTORY__assets/build/app.js" to data-main="__TEMPLATES_DIRECTORY__assets/js/app.js". This will load each module separately. Once debugged/finished then switch back and run the node r.js build.

I want to add this as a Grunt task (or even a Guard task to run with Linter and SASS compiler) in the future so you don't have to keep running the build command.

## Updating the Documentation
Documentation is built locally, but also available on the web at: http://guardian.github.io/mobile-apps-article-templates/, which displays the static files stored in the gh-pages branch. To update this publically viewable site with your latest changes, run the following commands:

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