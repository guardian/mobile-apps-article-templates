const path = require('path');

module.exports = {
    "env": {
        "browser": true
    },
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
        // temporary
        "no-param-reassign": 0,
        "no-use-before-define": 0,
        "no-plusplus": 0,
        "prefer-const": 0,
        "one-var": 0,
        "prefer-destructuring": 0,
        "no-var": 0,
        "no-mixed-operators": 0,
        "no-nested-ternary": 0,
        "max-len": 0,
        "no-loop-func": 0
    },
    'globals': {
        '__webpack_public_path__': true,
        'MobileRangeSlider': true,
        'GU': true,
        'YT': true,
        'twttr': true,
        'curl': true,
    }
};