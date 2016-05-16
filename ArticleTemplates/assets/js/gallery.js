define([
    'bootstraps/common',
    'bootstraps/gallery'
], function (
    common,
    gallery
) {
    'use strict';
    
    var module = {
        init: function () {
            common.init();
            gallery.init();
        }
    };

    return module;
});

