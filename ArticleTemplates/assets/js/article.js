define([
    'bootstraps/common',
    'bootstraps/article'
], function (
    common,
    article
) {
    'use strict';

    function Article() {
        common.init();
        article.init();
    }

    return Article;
});
