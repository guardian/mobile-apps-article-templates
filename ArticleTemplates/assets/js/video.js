define([
	'bootstraps/common',
    'bootstraps/video'
], function (
	common,
    video
) {
    'use strict';
    
    var module = {
        init: function () {
        	common.init();
            video.init();
        }
    };

    return module;
});