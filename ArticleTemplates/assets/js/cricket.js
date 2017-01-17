define([
    'bootstraps/common',
    'bootstraps/cricket',
    'bootstraps/liveblog'
], function (
    common,
    cricket,
    liveblog
) {
    'use strict';
    
    function init() {
        common.init();
        cricket.init();

        if (document.getElementsByClassName('article__body--liveblog').length > 0) {
            liveblog.init(common);
        }
    }

    return {
        init: init
    };
});
