define([
    'bootstraps/common',
    'bootstraps/liveblog'
], function (
    Common,
    Liveblog
) {
    'use strict';
    
    function init(){
        Common.init();
        Liveblog.init();
    }

    return {
        init: init
    };
});
