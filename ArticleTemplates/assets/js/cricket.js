define([
    'bootstraps/common',
    'bootstraps/cricket',
    'bootstraps/liveblog',
    'modules/$'
], function (
    Common,
    Cricket,
    Liveblog,
    $
) {
    'use strict';

    function init(){
        Common.init();
        Cricket.init();

        if ($('.article__body--liveblog').length > 0) {
            Liveblog.init();
        }
    }

    return {
        init: init
    };
});
