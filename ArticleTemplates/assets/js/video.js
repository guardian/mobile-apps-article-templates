define([
	'bootstraps/common',
    'bootstraps/video'
], function (
	common,
    video
) {
    'use strict';
    
    function init() {
        common.init();
        video.init();
    }

    return {
        init: init
    };
});