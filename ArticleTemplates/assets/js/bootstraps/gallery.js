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
            
            bean.on(window, 'resize.gallery orientationchange.gallery', GU.util.debounce(function () {
                $(".gallery")[0].removeAttribute("style");
                collagePlus.init(".gallery", ".gallery__image");
            }, 100));

            // remove this once ios stops using..
            window.redrawGallery = function() {
                $(".gallery")[0].removeAttribute("style");
                var orientation = window.orientation;
                var mode;
                if (orientation == 90 || orientation == -90) {
                    mode = "landscape";
                } else {
                    mode = "portrait";
                }
                collagePlus.init(".gallery", ".gallery__image", mode);
            };
        }
    },

    ready = function () {
        if (!this.initialised) {
            this.initialised = true;
            modules.galleryLayout();

        }
    };

    return {
        init: ready
    };
});