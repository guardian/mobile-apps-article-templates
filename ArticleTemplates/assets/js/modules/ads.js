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
                                            "<div class='advert-slot__label'>Advertisement</div>" +
                                            "<div class=\"advert-slot__wrapper\" id=\"advert-slot__wrapper\">" +
                                            "<div class='advert-slot__wrapper__content' id=" + tabletMpuId + "></div>" +
                                            "</div>" +
                                        "</div>";

                    $(".article__body > div > p:nth-of-type(1)").before(tabletMpuHtml);


                } else if (config.adsConfig == "mobile") {
                    var mobileMpuHtml = "<div class='advert-slot advert-slot--mpu advert-slot--mpu--mobile'>" +
                                            "<div class='advert-slot__label'>Advertisement</div>" +
                                            "<div class=\"advert-slot__wrapper\" id=\"advert-slot__wrapper\">" +
                                            "<div class='advert-slot__wrapper__content' id=" + mobileMpuId + "></div>" +
                                            "</div>" +
                                        "</div>",

                        bannerHtml =  "<div class='advert-slot__wrapper__content' id=" + bannerHtmlId + "></div>";

                    $(".article__body > div > p:nth-of-type(6)").after(mobileMpuHtml);
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
                    return formatter(r.left + document.body.scrollLeft, 
                        r.top+document.body.scrollTop, r.width, r.height);
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
            getBannerPosCallback : function(callbackNamespace, callbackFunction) {
                modules.getBannerPos(function(x, y, w, h){
                    window.GuardianJSInterface.bannerAdsPosition(x, y, w, h);
                });
            },
            // Android Timer
            timer : function(time, yPos) {
                setTimeout(function() {
                    modules.runPoller(time, yPos);
                }, 1000);
            },
            // Android Count
            runPoller : function(start, yPos) {
                var thisNumber = parseInt(start, 10) + 1;
                var yPolled;
                if (thisNumber <= 20) { 
                    yPolled = modules.getMpuOffsetTop();

                    if (yPolled != yPos) {
                          modules.getMpuPos(function(x, y, w, h){
                            window.GuardianJSInterface.mpuAdsPosition(x, y, w, h);
                        });
                    yPos = yPolled;  

                    }
                    modules.timer(thisNumber, yPos);
                }
            },
            // Android Poll for offSetTop position changes
            posPoller : function(y) {
                var yPos = y;
                modules.runPoller(1, yPos);
            },
            // Android Detect if iFrame present
            getAds: function () {

                window.getMpuPosCallback = function (callbackNamespace, callbackFunction) {

                    var interactive  =  (document.getElementsByTagName("iframe")[0] || 
                        document.getElementsByClassName("interactive")[0]) ? true : false;

                    function onloadHandler () { 
                        modules.getMpuPos(function(x, y, w, h){
                            window.GuardianJSInterface.mpuAdsPosition(x, y, w, h);
                        });  
                    }

                    function iframeHandler () {
                        modules.getMpuPos(function(x, y, w, h){
                            window.GuardianJSInterface.mpuAdsPosition(x, y, w, h);
                            modules.posPoller(y);
                        });
                    }

                    var loadAds = (interactive === true) ? iframeHandler() : onloadHandler();

                };

                window.applyNativeFunctionCall("getMpuPosCallback");

            },
            // iOS Timer
            iosTimer : function(time, yPos, interval) {

                setTimeout(function() {
                    modules.runIosPoller(time, yPos, interval);
                }, interval);
            },
            // iOS Count
            runIosPoller : function(start, yPos, interval) {
                var thisNumber = parseInt(start, 10) + 1;
                interval = interval + 200;

                var yPolled;
                yPolled = modules.getMpuOffsetTop();
                if (yPolled != yPos) {
                    window.location.href = 'x-gu://ad_moved';
                    yPos = yPolled;  
                }
                modules.iosTimer(thisNumber, yPos, interval);
            },
            // iOS Poll for offSetTop position changes
            iosPoller : function(y) {
                var yPos = y;
                modules.runIosPoller(1, yPos, 1000);
            },
            // iOS Ads, set Window object for ad position used by native code and start position polling
            updateAdsIos: function () {
                var y;
                window.getMpuPosCommaSeparated = modules.getMpuPosCommaSeparated;
                y = modules.getMpuOffsetTop();
                modules.iosPoller(y);
            },
            // general poller
            poller : function(interval, yPos, isAndroid, isInteractive, firstRun) {
                var newYPos = modules.getMpuOffsetTop();

                if(firstRun && isAndroid){
                    modules.updateAndroidPosition()
                }

                if(newYPos !== yPos){
                    if(isAndroid){
                        modules.updateAndroidPosition();
                    } else {
                        window.location.href = 'x-gu://ad_moved';
                    }                    
                }
               
                if(!isAndroid || (isAndroid && isInteractive)){
                    setTimeout(modules.poller.bind(modules, interval + 50, newYPos, isAndroid), interval);
                }
            },

            updateAndroidPosition : function() {
                modules.getMpuPos(function(x, y, w, h){
                    window.GuardianJSInterface.mpuAdsPosition(x, y, w, h);
                });
            }
        },

        ready = function (config) {
            if (!this.initialised) {
                this.initialised = true;
                
                if (config.adsEnabled == "true") {
                    modules.insertAdPlaceholders(config);

                    window.getMpuPosJson = modules.getMpuPosJson;
                    window.getBannerPosCallback = modules.getBannerPosCallback; 
                    window.getMpuPosCommaSeparated = modules.getMpuPosCommaSeparated; 

                    //modules.getAds(); // Used by Android
                    //modules.updateAdsIos(); // Used by iOS
                    modules.poller(1000, 
                        modules.getMpuOffsetTop(), 
                        $('body').hasClass('android'), 
                        $('iframe, body.interactive').length,
                        true
                    );                    
                }

            }
        };

    return {
        init: ready
    };

});
