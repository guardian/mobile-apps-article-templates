# Article Templates for Mobile Apps
[![npm version](https://badge.fury.io/js/%40guardian%2Fmobile-apps-article-templates.svg)](https://badge.fury.io/js/%40guardian%2Fmobile-apps-article-templates)

Article templates used within the Guardian’s next-generation iOS and Android applications. This repo also contains documentation that describes the components and layouts used across these templates.

## Requirements
* A Mac or Linux computer.
* [NVM](https://github.com/creationix/nvm).
* [NodeJS](https://nodejs.org/). Install using nvm: `nvm install v20.17.0`. Remember to add `nvm use v20.17.0` to your preferred shell startup file.
* You may need to install npm globally `npm install -g npm`.
* It is recommended you restart your shell to ensure changes added the startup file are applied.

## Developing
**Clone**
```bash
$ git clone git@github.com:guardian/mobile-apps-article-templates.git
```

**Install**
```bash
$ cd mobile-apps-article-templates
$ npm install
```

* If you get an error on this step regarding `lib/node_modules/npm/node_modules/promise-retry/index.js` or another module, running `npm install -g npm` and re-running `npm install` may fix it.

### Running on iOS simulator
* Checkout the branch you are developing against
* Run `npm run build`
* Checkout the [`ios-live`](https://github.com/guardian/ios-live/) project
* Edit the `package.json` file in the root of `ios-live`, replacing the version of the `@guardian/mobile-apps-article-templates` dependency with the relative path of the local templates repo:
```
"dependencies": {
    "@guardian/mobile-apps-article-templates": "file:../mobile-apps-article-templates"
}
```
* You will then need to run `npm install` in the `ios-live` directory that contains the `package.json` in the repo.
* If you find that the app is not using the expected version of the dependency (from your branch), try deleting `package-lock.json` and `node_modules` before running `npm install`.

### Running on Android simulator
* Checkout the branch you are developing against
* Run `npm run build`
* Checkout the [`android-news-app/`](https://github.com/guardian/android-news-app) project
* Edit the `package.json` file in `android-news-app/android-news-app/`, replacing the version of the `@guardian/mobile-apps-article-templates` dependency with the relative path of the local templates repo:
```
"dependencies": {
    "@guardian/mobile-apps-article-templates": "../../mobile-apps-article-templates"
}
```
* You will then need to run `npm install` in the `android-news-app/android-news-app` directory that contains the `package.json` in the repo.

### Building from S3 (iOS or Android)
* Find the branch you want to test on [teamCity](https://teamcity.gutools.co.uk/viewType.html?buildTypeId=Apps_Templates_TemplatesS3v2)
* Click run to build the branch and upload to s3
* You can find the s3 package in `bundle-url.txt` under `artifacts`

Update your package.json:
```
"dependencies": {
    "@guardian/mobile-apps-article-templates": "https://s3-eu-west-1.amazonaws.com/builds.gutools.co.uk/guardian-mobile-apps-article-templates-v1.0.190.tgz"
}
```

## NPM scripts
NPM will provide the following services:
* `npm run test` runs the JS unit tests from the `test/spec/unit/` directory
* `npm run build` builds JS/CSS assets, used on CI environment for building assets
* `npm run dev` builds JS and CSS (with source maps).
* `npm run release` generates a changeset file, which makes `changesets` to create a release pull request when the PR is merged

## Publish to npm repository
This repository has changed to `changesets` to publish the package to NPM package.
* In your feature branch, run `npm run release` to generate the changeset file.  We usually just bump the patch version number.
* Add the changeset file generated undder `.changeset` directory, commit and push to github
* When your PR is merged, the github action for CI will create a release pull request ([example](https://github.com/guardian/mobile-apps-article-templates/pull/1693))
* You can merge this release pull request if you want to publish the package to npm repository.
* Alternatively, you may leave the release pull request open.  If other PR are merged, their change sets will just be added to this release pull request.

## Example templates
These are examples of the main templates used across apps:

| Template | Article |
| --- | --- |
| Article | https://www.theguardian.com/cities/2019/may/31/madrid-set-to-end-clean-air-project-in-rightwing-power-switch |
| Podcast | https://www.theguardian.com/news/audio/2019/may/31/trump-coming-to-see-the-queen-but-what-actually-happens-on-a-state-visit-podcast |
| Video | https://www.theguardian.com/global/video/2019/may/17/labours-laura-parker-farage-winning-would-be-uks-worst-legacy |
| Gallery | https://www.theguardian.com/film/gallery/2019/may/30/the-horror-apocalypse-now-unseen-in-pictures |
| Immersive | https://www.theguardian.com/sport/2019/may/31/i-wouldnt-be-the-refugee-id-be-the-girl-who-kicked-ass-how-taekwondo-made-me |
| Liveblog | https://www.theguardian.com/sport/live/2019/may/31/west-indies-v-pakistan-cricket-world-cup-2019-live |
| Immersive interactive | https://www.theguardian.com/us-news/ng-interactive/2019/may/29/chemical-checkout-what-might-be-hiding-in-your-groceries |
| Photo essay | https://www.theguardian.com/society/2019/may/31/amish-on-holiday-sarasota-florida-dina-litovsky-photo-essay |
| Guardian labs | https://www.theguardian.com/the-abcs-of-recruiting-teachers-remotely/2020/may/01/the-new-rules-of-remote-recruiting-how-to-prepare-for-an-online-interview |
