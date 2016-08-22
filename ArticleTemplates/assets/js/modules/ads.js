/*global window,document,console,define */
define([
    'modules/$',
    'bonzo'
], function (
    $,
    bonzo
) {
    'use strict';

    var positionPoller,
        numberOfMpus = 0,
        adsType,
        modules = {
            insertAdPlaceholders: function (config) {
                numberOfMpus = 1;
                var mpuHtml = modules.createMpuHtml(numberOfMpus);

                // To mimic the correct positioning on full width tablet view, we will need an 
                // empty div to pad out the text so we can position absolutely over it.
                $('.article__body > div.prose > :first-child').before('<div class="advert-slot advert-slot--placeholder"></div>');

                var nrParagraph = ( parseInt(config.mpuAfterParagraphs, 10) || 6 ) - 1;

                $('.article__body > div.prose > p:nth-of-type(' + nrParagraph + ') ~ p + p').first().before(mpuHtml);
            },

            insertLiveblogAdPlaceholders: function () {
                window.updateLiveblogAdPlaceholders = function(reset) {
                    if (reset) {
                        // remove existing placeholders and reset counter
                        numberOfMpus = 0;
                        $('.advert-slot--mpu').remove();
                    }

                    $('.article__body > .block').each(function(block, index) {
                        // insert an advert after every 2nd and 7th block
                        if (index === 1 || index === 6) {
                            numberOfMpus++;
                            var mpuHtml = modules.createMpuHtml(numberOfMpus);
                            $(block).after(mpuHtml);
                        }
                    });

                    if (reset) {
                        // call to update native advert position
                        if(modules.isAndroid){
                            modules.updateAndroidPosition();
                        } else {
                            GU.util.signalDevice('ad_moved');
                        }
                    }
                };

                window.updateLiveblogAdPlaceholders();
            },

            createMpuHtml: function(id) {
                return '<div class="advert-slot advert-slot--mpu">' +
                            '<div class="advert-slot__label">' +
                                'Advertisement' +
                                '<a class="advert-slot__action" href="x-gu://subscribe">' +
                                    'Hide' +
                                    '<span data-icon="&#xe04F;"></span>' +
                                '</a>' +
                            '</div>' +
                            '<div class="advert-slot__wrapper" id="advert-slot__wrapper">' +
                            '<div class="advert-slot__wrapper__content" id="' + id + '"></div>' +
                            '</div>' +
                        '</div>';
            },

            // return the position of all mpus.
            // This function is an internal function which accepts a function
            // formatter(left1, top1, width1, height1, left2, top2, width2, height2)
            getMpuPos: function(formatter) {
                var $advertSlots = $('.advert-slot__wrapper');

                if ($advertSlots.length) {
                    var scrollLeft = document.body.scrollLeft,
                        scrollTop = document.body.scrollTop,
                        params = [];

                    $advertSlots.each(function(ad, index) {
                        var adPos = ad.getBoundingClientRect();

                        if (adPos.width !== 0 && adPos.height !== 0) {
                            params.push(adPos.left + scrollLeft);
                            params.push(adPos.top + scrollTop);
                            params.push(adPos.width);
                            params.push(adPos.height);
                        }
                    });

                    if (params.length > 4) {
                        return formatter(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7]);
                    } else {
                        return formatter(params[0], params[1], params[2], params[3], -1, -1, -1, -1);
                    }
                } else {
                    return null;
                }
            },

            getMpuPosCommaSeparated: function() {
                return modules.getMpuPos(function(x1, y1, w1, h1, x2, y2, w2, h2) {
                    if (numberOfMpus > 1) {
                        return x1 + ',' + y1 + ',' + x2 + ',' + y2;
                    } else {
                        return x1 + ',' + y1;
                    }
                });
            },

            getMpuOffset: function() {
                return modules.getMpuPos(function(x1, y1, w1, h1, x2, y2, w2, h2) {
                    if (numberOfMpus > 1) {
                        return x1 + "-" + y1 + ":" + x2 + "-" + y2;
                    } else {
                        return x1 + "-" + y1;
                    }
                });
            },

            updateAndroidPosition : function() {
                if (adsType === 'liveblog') {
                    modules.getMpuPos(function(x1, y1, w1, h1, x2, y2, w2, h2){
                        window.GuardianJSInterface.mpuLiveblogAdsPosition(x1, y1, w1, h1, x2, y2, w2, h2);
                    });
                } else {
                    modules.getMpuPos(function(x1, y1, w1, h1, x2, y2, w2, h2){
                        window.GuardianJSInterface.mpuAdsPosition(x1, y1, w1, h1);
                    });
                }
            },

            initMpuPoller: function(){
                modules.poller(1000,
                    modules.getMpuOffset(),
                    true
                );
            },

            poller: function(interval, adPositions, firstRun) {
                var newAdPositions = modules.getMpuOffset();

                if(firstRun && modules.isAndroid){
                    modules.updateAndroidPosition();
                }

                if(newAdPositions !== adPositions){
                    if(modules.isAndroid){
                        modules.updateAndroidPosition();
                    } else {
                        GU.util.signalDevice('ad_moved');
                    }
                }

                positionPoller = setTimeout(modules.poller.bind(modules, interval + 50, newAdPositions), interval);
            },

            killMpuPoller: function () {
                window.clearTimeout(positionPoller);
                positionPoller = undefined;
            },

            fireAdsReady: function() {
                if (!$('body').hasClass('no-ready') && $('body').attr('data-use-ads-ready') === 'true') {
                    GU.util.signalDevice('ads-ready');
                }
            },

            // Used by quizzes to move the advert
            updateMPUPosition: function(yPos) {
                if (!yPos) {
                    yPos = $('.advert-slot__wrapper').first().offset().top;
                }

                var newYPos = $('.advert-slot__wrapper').first().offset().top;

                if(newYPos !== yPos){
                    if(modules.isAndroid){
                        modules.updateAndroidPosition();
                    } else {
                        GU.util.signalDevice('ad_moved');
                    }
                }

                return newYPos;
            }
        },

        ready = function (config) {
            modules.isAndroid = $('body').hasClass('android');

            if (!this.initialised) {
                this.initialised = true;

                if (config.adsEnabled == 'true' || (config.adsEnabled && config.adsEnabled.match && config.adsEnabled.match(/mpu/))) {
                    // Insert advert placeholders for liveblog & cricket liveblogs when not 'the minute'
                    if (config.adsType === 'liveblog' && !$('body').hasClass('the-minute')) {
                        modules.insertLiveblogAdPlaceholders();
                        adsType = 'liveblog';
                    } else {
                        modules.insertAdPlaceholders(config);
                        adsType = 'default';
                    }

                    window.initMpuPoller = modules.initMpuPoller;
                    window.applyNativeFunctionCall('initMpuPoller');
                    window.killMpuPoller = modules.killMpuPoller;

                    window.getMpuPosCommaSeparated = modules.getMpuPosCommaSeparated;

                    if(!modules.isAndroid){
                        modules.initMpuPoller();
                    }

                    modules.fireAdsReady(window);
                }
            }
        };

    return {
        init: ready,
        modules: modules
    };

});
