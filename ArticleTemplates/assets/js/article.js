define([
    'bootstraps/common',
    'bootstraps/article'
], function (
    Common,
    Article
) {
    'use strict';

    function init(){
       Common.init();
        Article.init();
    }

    return {
        init: init
    };
});
