define([
    'bootstraps/common',
    'bootstraps/liveblog'
], function (
    common,
    liveblog
) {
    'use strict';
    
    function init() {
        common.init();
        liveblog.init();
    }

    return {
        init: init
    };
});
