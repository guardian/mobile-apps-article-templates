/*global window,console,define */
define([
    'bean',
    'bonzo',
    'flipSnap',
    'modules/$'
], function (
    bean,
    bonzo,
    flipSnap,
    $
) {
    'use strict';

    var modules = {
            setupGlobals: function () {
                // Global functions to handle comments, called by native code
                window.articleCardsInserter = function (html) {
                    if (!html) {
                        $('.related-content').hide();
                    } else {
                        $('.related-content__container').html('<ul class="related-content__list">' + html + '</ul>');
                        // setup the snap to grid functionality 
                        modules.snapToGrid('.related-content__list');
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
            },
            snapToGrid: function(el) {
                // add a class with the number of child items, so we can set the widths based on that 
                $(el).addClass(el.replace('.','') + '--items-' + $(el + ' > li').length);
                flipSnap(el);
            }
        },

        ready = function () {
            if (!this.initialised) {
                this.initialised = true;
                if ($('.related-content__list').length) {
                    // Test pages will already have a list so just set the snap to grid
                    modules.snapToGrid('.related-content__list');
                } else {
                    // Article pages need to be set up 
                    modules.setupGlobals();
                }
            }
        };

    return {
        init: ready
    };

});