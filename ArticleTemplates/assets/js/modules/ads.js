/*global window,document,console,define */
define([
    'modules/$',
    'bonzo'
], function (
    $,
    bonzo
) {
    'use strict';

    var tabletMpuId = 'advert-mpu-content',
        mobileMpuId = 'advert-mobile-mpu-content',

        modules = {
            insertAdPlaceholders: function (config) {
                var windowWidth = window.innerWidth,
                    counter = 0,
                    mpuId = '',
                    mpuHtml = '';

                $('.article__body > div > *:nth-child(-n+3)').each(function() {
                    var tagName = $(this)[0].tagName;

                    if (tagName == 'P' || 
                        tagName == 'H2' || 
                        tagName == 'BLOCKQUOTE' ||
                        (tagName == 'FIGURE' && $(this).hasClass('element-placeholder')) ||
                        $(this).hasClass('element-video')) {
                        counter++;
                    }
                });

                // With split screen now available on ios, tablets can now end up being displayed in the mobile format.
                // To overcome this decide mpu placement with css positioning instead of appending in different places
                if (config.adsConfig == 'tablet' && counter == 3) {
                    mpuId = tabletMpuId;
                } else if (config.adsConfig == 'mobile') {
                    mpuId = mobileMpuId;
                }

                if (mpuId !== '') {
                    mpuHtml = '<div class="advert-slot advert-slot--mpu">' +
                                    '<div class="advert-slot__label">' +
                                        'Advertisement' +
                                        '<a class="advert-slot__action" href="x-gu://subscribe">' +
                                            'Hide' +
                                            '<span data-icon="&#xe04F;"></span>' +
                                        '</a>' +
                                    '</div>' +
                                    '<div class="advert-slot__wrapper" id="advert-slot__wrapper">' +
                                    '<div class="advert-slot__wrapper__content" id="' + mpuId + '"></div>' +
                                    '</div>' +
                                '</div>';
                    // To mimic the correct positioning on full width tablet view, we will need an 
                    // empty div to pad out the text so we can position absolutely over it.
                    $('.article__body > div > :first-child').before('<div class="advert-slot advert-slot--placeholder"></div>');
                }

                var nrParagraph = ( parseInt(config.mpuAfterParagraphs, 10) || 6 ) - 1;
                $('.article__body > div > p:nth-of-type(' + nrParagraph + ') ~ p + p').first().before(mpuHtml);
            },

            // return the current MPU's position.
            // This function is an internal function which accepts a function
            // formatter(left, top, width, height)

            getMpuPos : function(formatter) {
                var r;
                var el = document.getElementById('advert-slot__wrapper');
                if (el) {
                    r = el.getBoundingClientRect();
                    if(r.width !== 0 && r.height !== 0){
                        return formatter(r.left + document.body.scrollLeft,
                            r.top+document.body.scrollTop, r.width, r.height);
                    }
                } else {
                    return null;
                }
            },

            getMpuPosJson : function() {
                return modules.getMpuPos(function(x, y, w, h) {
                    return '{"left":' + x + ', "top":' + y + ', "width":' + w +', "height":' + h + '}';
                });
            },
            getMpuPosCommaSeparated : function() {
                return modules.getMpuPos(function(x, y, w, h) {
                    return x + ',' + y;
                });
            },
            getMpuOffsetTop : function() {
                return modules.getMpuPos(function(x, y, w, h) {
                    return y;
                });
            },
            poller : function(interval, yPos, firstRun) {
                var newYPos = modules.getMpuOffsetTop();

                if(firstRun && this.isAndroid){
                    modules.updateAndroidPosition();
                }

                if(newYPos !== yPos){
                    if(this.isAndroid){
                        modules.updateAndroidPosition();
                    } else {
                        window.location.href = 'x-gu://ad_moved';
                    }
                }

                setTimeout(modules.poller.bind(modules, interval + 50, newYPos), interval);
            },

            updateMPUPosition: function(yPos) {
                if (!yPos) {
                    yPos = $('#advert-slot__wrapper').offset().top;
                }

                var newYPos = $('#advert-slot__wrapper').offset().top;

                if(newYPos !== yPos){
                    if(this.isAndroid){
                        modules.updateAndroidPosition();
                    } else {
                        window.location.href = 'x-gu://ad_moved';
                    }
                }

                return newYPos;
            },

            updateAndroidPosition : function() {
                modules.getMpuPos(function(x, y, w, h){
                    window.GuardianJSInterface.mpuAdsPosition(x, y, w, h);
                });
            },

            initMpuPoller: function(){
                modules.poller(1000,
                    modules.getMpuOffsetTop(),
                    true
                );
            },

            fireAdsReady: function(_window) {
                if (!$('body').hasClass('no-ready') && $('body').attr('data-use-ads-ready') === 'true') {
                    _window.location.href = 'x-gu://ads-ready';
                }
            }
        },

        ready = function (config) {
            modules.isAndroid = $('body').hasClass('android');

            if (!this.initialised) {
                this.initialised = true;

                if (config.adsEnabled == 'true' || (config.adsEnabled !== null && config.adsEnabled.match && config.adsEnabled.match(/mpu/))) {
                    modules.insertAdPlaceholders(config);
                    window.getMpuPosJson = modules.getMpuPosJson;
                    window.getMpuPosCommaSeparated = modules.getMpuPosCommaSeparated;
                    window.initMpuPoller = modules.initMpuPoller;
                    window.applyNativeFunctionCall('initMpuPoller');

                    if(!modules.isAndroid){
                        modules.initMpuPoller();
                    }
                }

                modules.fireAdsReady(window);
            }
        };

    return {
        init: ready,
        // for testing purposes
        modules: modules
    };

});
