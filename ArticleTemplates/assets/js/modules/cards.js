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
                // Global functions to handle related content, called by native code
                window.articleCardsInserter = function (html) {
                    if (!html) {
                        modules.articleCardsFailed();
                    } else {
                        $('.related-content').html(html);

                        // setup the snap to grid functionality 
                        modules.snapToGrid('.related-content__list');
                    }
                };

                window.articleCardsFailed = function(){
                   modules.articleCardsFailed();
                };

                window.applyNativeFunctionCall('articleCardsInserter');
                window.applyNativeFunctionCall('articleCardsFailed');
            },
            articleCardsFailed: function(){
                $('.related-content').addClass('related-content--has-failed');
            },
            snapToGrid: function(el) {
                
                // Setup now and re-init on resize or orientation change
                modules.setUpFlipSnap(el);
                bean.on(window, 'resize.cards orientationchange.cards', window.ThrottleDebounce.debounce(100, false, function () {
                    if (modules.flipSnap) {
                        modules.flipSnap.destroy();
                        $(el).removeAttr('style');
                    }
                    modules.setUpFlipSnap(el);
                }));
            },
            setUpFlipSnap: function(el) {
                modules.flipSnap = null;
                var list = $(el),
                    container = list.parent()[0],
                    containerStyle = container.currentStyle || window.getComputedStyle(container),
                    containerWidth = container.offsetWidth - parseInt(containerStyle.paddingRight.replace('px','')) - parseInt(containerStyle.paddingLeft.replace('px',''));

                // add a class with the number of child items, so we can set the widths based on that 
                list.addClass('related-content__list--items-' + list[0].childElementCount);

                // if the inner content is wider than the container set up the scrolling
                if (list[0].scrollWidth > containerWidth) {
                    modules.flipSnap = flipSnap(el);

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