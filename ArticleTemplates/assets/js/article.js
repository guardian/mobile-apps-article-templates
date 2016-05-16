define([
	'bootstraps/common',
    'bootstraps/article'
], function (
	common,
    article
) {
    'use strict';
    
    var module = {
        init: function () {
        	common.init();
            article.init();
        }
    };

    return module;
});
