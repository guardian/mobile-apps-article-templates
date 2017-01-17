define([
    'bootstraps/common',
    'bootstraps/gallery'
], function (
    common,
    gallery
) {
    'use strict';
    
    function init() {
        common.init();
        gallery.init();
    }

    return {
        init: init
    };
});

