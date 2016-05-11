define([
	'bootstraps/common',
    'bootstraps/audio'
], function (
	common,
    audio
) {
    'use strict';
    
    var module = {
        init: function () {
        	common.init();
            audio.init();
        }
    };

    return module;
});