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

                window.logOnScreen("onorientationchange " + document.body.clientWidth);
                window.logOnScreen("orientation is " +window.orientation);
            },
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
                window.logOnScreen("redrawGallery " + mode);

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