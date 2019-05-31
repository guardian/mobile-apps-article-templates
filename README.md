# Article Templates for Mobile Apps
[![npm version](https://badge.fury.io/js/%40guardian%2Fmobile-apps-article-templates.svg)](https://badge.fury.io/js/%40guardian%2Fmobile-apps-article-templates)

Article templates used within the Guardian’s next-generation iOS and Android applications. This repo also contains documentation that describes the components and layouts used across these templates.

## Requirements
* A Mac or Linux computer.
* [NVM](https://github.com/creationix/nvm).
* [NodeJS](https://nodejs.org/). Install using nvm: `nvm install v8.15.0`. Remember to add `nvm use v8.15.0` to your preferred shell startup file.
* You may need to install npm globally `npm install -g npm`
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

### Building from s3 (iOS or Android)
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
