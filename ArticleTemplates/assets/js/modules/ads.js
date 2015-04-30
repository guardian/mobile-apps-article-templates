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
        bannerHtmlId = 'advert-banner-content',

        modules = {
            insertAdPlaceholders: function (config) {
                var windowWidth = window.innerWidth;

                var counter = 0;

                $(".article__body > div > *:nth-child(-n+3)").each(function() {

                    var tagName = $(this)[0].tagName;

                    if (tagName == "P" || tagName == "H2" || tagName == "BLOCKQUOTE") {
                        counter++;
                    } else if (tagName == "FIGURE" && $(this).hasClass("element-placeholder") ||
                        $(this).hasClass("element-video")) {
                        counter++;
                    }

                });

                if (config.adsConfig == "tablet" && counter == 3) {
                    var tabletMpuHtml = "<div class='advert-slot advert-slot--mpu advert-slot--mpu--tablet'>" +
                                            "<div class='advert-slot__label'>" +
                                                "Advertisement" +
                                                "<a class='advert-slot__action' href='x-gu://subscribe'>" +
                                                    "Hide" +
                                                    "<span data-icon='&#xe04F;'></span>" +
                                                "</a>" +
                                            "</div>"  +
                                            "<div class=\"advert-slot__wrapper\" id=\"advert-slot__wrapper\">" +
                                            "<div class='advert-slot__wrapper__content' id=" + tabletMpuId + "></div>" +
                                            "</div>" +
                                        "</div>";

                    $(".article__body > div > p:nth-of-type(1)").before(tabletMpuHtml);


                } else if (config.adsConfig == "mobile") {
                    
                    var mobileMpuHtml = "<div class='advert-slot advert-slot--mpu advert-slot--mpu--mobile'>" +
                                            "<div class='advert-slot__label'>" +
                                                "Advertisement" +
                                                "<a class='advert-slot__action' href='x-gu://subscribe'>" +
                                                    "Hide" +
                                                    "<span data-icon='&#xe04F;'></span>" +
                                                "</a>" +
                                            "</div>"  +
                                            "<div class=\"advert-slot__wrapper\" id=\"advert-slot__wrapper\">" +
                                            "<div class='advert-slot__wrapper__content' id=" + mobileMpuId + "></div>" +
                                            "</div>" +
                                        "</div>",

                        bannerHtml =  "<div class='advert-slot__wrapper__content' id=" + bannerHtmlId + "></div>";


                    var nrParagraph = ( parseInt(config.mpuAfterParagraphs, 10) || 6 ) - 1;
                    $(".article__body > div > p:nth-of-type(" + nrParagraph + ") ~ p + p").first().before(mobileMpuHtml);
                    $(".advert-slot__wrapper").prepend(bannerHtml);

                }
            },

            // return the current top Banner's position.
            // This function is an internal function which accepts a function
            // formatter(left, top, width, height)

            getBannerPos : function(formatter) {
                var r;
                var el = document.getElementById("banner_container");
                if (el) {
                    r = el.getBoundingClientRect();
                    return formatter(r.left + document.body.scrollLeft, r.top+document.body.scrollTop,
                        r.width, r.height);
                } else {
                    return null;
                }
            },

            // return the current MPU's position.
            // This function is an internal function which accepts a function
            // formatter(left, top, width, height)

            getMpuPos : function(formatter) {
                var r;
                var el = document.getElementById("advert-slot__wrapper");
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
            getBannerPosCallback : function() {
                modules.getBannerPos(function(x, y, w, h){
                    window.GuardianJSInterface.bannerAdsPosition(x, y, w, h);
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

            fireAdsReady: function(_window){
                if (!$('body').hasClass('no-ready') && $('body').attr('data-use-ads-ready') === 'true') {
                    _window.location.href = 'x-gu://ads-ready';
                }                  
            }
        },

        ready = function (config) {
            modules.isAndroid = $('body').hasClass('android');

            if (!this.initialised) {
                this.initialised = true;

                if (config.adsEnabled == "true" || (config.adsEnabled.match && config.adsEnabled.match(/mpu/))) {
                    modules.insertAdPlaceholders(config);
                    window.getMpuPosJson = modules.getMpuPosJson;
                    window.getBannerPosCallback = modules.getBannerPosCallback;
                    window.getMpuPosCommaSeparated = modules.getMpuPosCommaSeparated;
                    window.initMpuPoller = modules.initMpuPoller;
                    window.applyNativeFunctionCall('initMpuPoller');
                    window.applyNativeFunctionCall('getBannerPosCallback');

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
