define([
    'bootstraps/common',
    'bootstraps/liveblog'
], function (
    common,
    liveblog
) {
    'use strict';
    
    var module = {
        init: function () {
            common.init();
            liveblog.init();
        }
    };

    return module;
});
