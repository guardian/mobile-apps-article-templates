define([
    'bootstraps/common',
    'bootstraps/football',
    'bootstraps/liveblog',
    'modules/$'
], function (
    Common,
    Football,
    Liveblog,
    $
) {
    'use strict';
    
    function init(){
        Common.init();
        Football.init();

        if ($('.article__body--liveblog').length > 0) {
            Liveblog.init();
        }
    }

    return {
        init: init
    };
});
