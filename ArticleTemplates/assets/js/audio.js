define([
    'bootstraps/common',
    'bootstraps/audio'
], function (
    Common,
    Audio
) {
    'use strict';
    
    function init(){
        Common.init();
        Audio.init();
    }

    return {
        init: init
    };
});
