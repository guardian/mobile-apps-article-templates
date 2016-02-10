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
        liveblogAdId = 0,

        modules = {
            insertAdPlaceholders: function (config) {
                var counter = 0,
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
                    mpuHtml = modules.createMpuHtml(mpuId);
                    // To mimic the correct positioning on full width tablet view, we will need an 
                    // empty div to pad out the text so we can position absolutely over it.
                    $('.article__body > div.prose > :first-child').before('<div class="advert-slot advert-slot--placeholder"></div>');
                }

                var nrParagraph = ( parseInt(config.mpuAfterParagraphs, 10) || 6 ) - 1;
                $('.article__body > div.prose > p:nth-of-type(' + nrParagraph + ') ~ p + p').first().before(mpuHtml);
            },

            insertLiveblogAdPlaceholders: function () {
                window.updateLiveblogAdPlaceholders = function(htmlObject) {
                    var blocks = htmlObject.getElementsByClassName('block');

                    $(blocks).each(function(block, index) {
                        // insert an advert after every 2nd and 7th block
                        if (index === 1 || index === 6) {
                            var id = 'mpu' + liveblogAdId++,
                                mpuHtml = modules.createMpuHtml(id);
                            $(block).after(mpuHtml);
                        }
                    });

                    return htmlObject.innerHTML;
                };

                window.updateLiveblogAdPlaceholders($('.article__body')[0]);
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

            // return the current MPU's position.
            // This function is an internal function which accepts a function
            // formatter(left, top, width, height)
            getMpuPos: function(formatter) {
                var r;
                var el = document.getElementByClassName('advert-slot__wrapper')[0];
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

            getLiveblogMpuPos: function(formatter) {
                var $advertSlots = $('.advert-slot__wrapper');

                if ($advertSlots.length) {
                    var scrollLeft = document.body.scrollLeft,
                        scrollTop = document.body.scrollTop,
                        params;

                    $advertSlots.each(function(ad, index) {
                        var coords = ad.getBoundingClientRect();
                    });
                } else {
                    return null;
                }

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

            getMpuPosJson: function() {
                return modules.getMpuPos(function(x, y, w, h) {
                    return '{"left":' + x + ', "top":' + y + ', "width":' + w +', "height":' + h + '}';
                });
            },

            getMpuPosCommaSeparated: function() {
                return modules.getMpuPos(function(x, y, w, h) {
                    return x + ',' + y;
                });
            },

            getMpuOffsetTop: function() {
                return modules.getMpuPos(function(x, y, w, h) {
                    return y;
                });
            },

            getLiveblogMpuOffsetTop:  function() {
                return modules.getLiveblogMpuPos(function(x, y, w, h) {
                    return y;
                });
            },

            poller: function(interval, yPos, firstRun) {
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

            liveblogPoller: function(interval, yPosArray, firstRun) {
                if(firstRun && this.isAndroid){
                    modules.updateAndroidPosition();
                }

                var newYPos = modules.getMpuOffsetTop();

                if(newYPos !== yPos){
                    if(this.isAndroid){
                        modules.updateAndroidLiveblogPosition();
                    } else {
                        window.location.href = 'x-gu://ad_moved';
                    }
                }

                setTimeout(modules.liveblogPoller.bind(modules, interval + 50, newYPosArray), interval);
            },

            updateMPUPosition: function(yPos) {
                if (!yPos) {
                    yPos = $('.advert-slot__wrapper').first().offset().top;
                }

                var newYPos = $('.advert-slot__wrapper').first().offset().top;

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

            updateAndroidLiveblogPosition : function() {
                modules.getLiveblogMpuPos(function(x1, y1, w1, h1, x2, y2, w2, h2){
                    window.GuardianJSInterface.mpuLiveblogAdsPosition(x1, y1, w1, h1, x2, y2, w2, h2);
                });
            },

            initMpuPoller: function(){
                modules.poller(1000,
                    modules.getMpuOffsetTop(),
                    true
                );
            },

            initMpuLiveblogPoller: function(){
                modules.liveblogPoller(1000,
                    modules.getLiveblogMpuOffsetTop(),
                    true
                );
            },

            fireAdsReady: function(_window) {
                if (!$('body').hasClass('no-ready') && $('body').attr('data-use-ads-ready') === 'true') {
                    console.log('test');
                    _window.location.href = 'x-gu://ads-ready';
                }
            }
        },

        ready = function (config) {
            modules.isAndroid = $('body').hasClass('android');

            if (!this.initialised) {
                this.initialised = true;

                if (config.adsEnabled == 'true' || (config.adsEnabled !== null && config.adsEnabled.match && config.adsEnabled.match(/mpu/))) {
                    if (config.contentType === 'liveblog') {
                        modules.insertLiveblogAdPlaceholders();
                        window.initMpuLiveblogPoller = modules.initMpuLiveblogPoller;
                        window.applyNativeFunctionCall('initMpuLiveblogPoller');
                    } else {
                        modules.insertAdPlaceholders(config);
                        window.initMpuPoller = modules.initMpuPoller;
                        window.applyNativeFunctionCall('initMpuPoller');
                    }
                    window.getMpuPosJson = modules.getMpuPosJson;
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
