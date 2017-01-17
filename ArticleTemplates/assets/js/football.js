define([
    'bootstraps/common',
    'bootstraps/football',
    'bootstraps/liveblog'
], function (
    common,
    football,
    liveblog
) {
    'use strict';
    
    function init() {
        common.init();
        football.init();

        if (document.getElementsByClassName('article__body--liveblog').length > 0) {
            liveblog.init(common);
        }
    }

    return {
        init: init
    };
});