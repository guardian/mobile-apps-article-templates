/*global window,console,define */
define([
    'bean',
    'bonzo',
    'modules/$'
], function (
    bean,
    bonzo,
    $
) {
    'use strict';

    var modules = {
            setupGlobals: function () {
                // Global functions to handle comments, called by native code
                window.articleCardsInserter = function (html) {
                    if (!html) {
                        $(".container--related").hide();
                    } else {
                        $(".container--related .container__body").html(html);
                    }
                };
                window.applyNativeFunctionCall('articleCardsInserter');
            }
        },

        ready = function () {
            if (!this.initialised) {
                this.initialised = true;
                modules.setupGlobals();
                // console.info("Cards ready");
            }
        };

    return {
        init: ready
    };

});