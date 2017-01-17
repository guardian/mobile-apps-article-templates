define([
	'bootstraps/common',
    'bootstraps/audio'
], function (
	common,
    audio
) {
    'use strict';
    
    function init() {
        common.init();
        audio.init();
    }

    return {
        init: init
    };
});