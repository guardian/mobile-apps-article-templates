define([
    'bootstraps/common',
    'bootstraps/gallery'
], function (
    Common,
    Gallery
) {
    'use strict';
    
    function init(){
       Common.init();
        Gallery.init();
    }

    return {
        init: init
    };
});
