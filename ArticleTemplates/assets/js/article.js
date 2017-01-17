define([
	'bootstraps/common',
    'bootstraps/article'
], function (
	common,
    article
) {
    'use strict';
    
    function init() {
        common.init();
        article.init();
    }

    return {
        init: init
    };
});
