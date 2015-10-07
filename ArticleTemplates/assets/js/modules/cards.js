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
                        $(".related-content").hide();
                    } else {
                        $(".related-content__container").html('<ul class="related-content__list">' + html + '</ul>');
                    }
                };
                window.applyNativeFunctionCall('articleCardsInserter');
            },
            getNumberOfTextLines:function (el) {
                //returns number of text lines of single html element
                var cssValues = window.getComputedStyle(el, null),
                    lineHeight = cssValues.lineHeight.replace('px', ''),
                    paddingTop = cssValues.paddingTop.replace('px', ''),
                    paddingBottom = cssValues.paddingBottom.replace('px', ''),
                    elementHeight = el.offsetHeight,
                    numberOfLines = (elementHeight - paddingTop - paddingBottom) / lineHeight;

                return parseInt(numberOfLines);
            }
        },

        ready = function () {
            if (!this.initialised) {
                this.initialised = true;
                modules.setupGlobals();
            }
        };

    return {
        init: ready
    };

});