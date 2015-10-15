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
                        $('.related-content').html(html);
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

                // Android needs to be notified of touch start / touch end so article navigation can be 
                // disabled / enabled when the using is scrolling through cards
                if (bonzo(document.body).hasClass('android')) {
                    // Send true on touchstart
                    bean.on(document.body, 'touchstart.android', el, function() {
                        window.GuardianJSInterface.registerRelatedCardsTouch(true);
                    });
                    // Send false on touchend
                    bean.on(document.body, 'touchend.android', el, function() {
                        window.GuardianJSInterface.registerRelatedCardsTouch(false);
                    });
                }
            }
        },

        ready = function () {
            if (!this.initialised) {
                this.initialised = true;
                if (bonzo($('.related-content__list')).length) {
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