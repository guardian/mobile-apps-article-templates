/*global window,document,console,define */
define([
    'bean',
    'modules/$',
    'modules/collagePlus'
], function (
    bean,
    $,
    collagePlus
) {
    'use strict';

    var modules = {
        galleryLayout: function () {
            collagePlus.init(".gallery", ".gallery__image");
            window.onorientationchange = function(){
                $(".gallery")[0].removeAttribute("style");
                collagePlus.init(".gallery", ".gallery__image");
            };
        }
    },

    ready = function () {
        if (!this.initialised) {
            this.initialised = true;
            modules.galleryLayout();
            //console.info("Gallery ready");
        }
    };

    return {
        init: ready
    };
});
