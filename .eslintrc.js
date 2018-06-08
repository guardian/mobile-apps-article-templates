const path = require('path');

module.exports = {
    "parser": "babel-eslint",
    "parserOptions": {
        "sourceType": "module",
        "allowImportExportEverywhere": true
    },
    "extends": "airbnb-base",
    "settings": {
        "import/resolver": {
            "node": {
                "paths": [
                    path.resolve(__dirname, 'ArticleTemplates/assets/js')
                ]
            }
        }
    },
    "rules": {
        "indent": [2, 4],
        "import/prefer-default-export": 0,
        "arrow-parens": 0,
        "func-names": 0,
        "no-plusplus": 0,
        "no-param-reassign": [2, { "props": false }]
    },
    'globals': {
        'document': true,
        'window': true,
        '__webpack_public_path__': true,
        'MobileRangeSlider': true,
        'GU': true,
        'YT': true,
    }
};