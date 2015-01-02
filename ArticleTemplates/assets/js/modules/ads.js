/*global window,document,console,define */
define([
    'modules/$'
], function (
    $
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
                    } else if (tagName == "FIGURE" && $(this).hasClass("element-placeholder") || $(this).hasClass("element-video")) {
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
                    return formatter(r.left + document.body.scrollLeft, r.top+document.body.scrollTop, r.width, r.height);
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
                    return formatter(r.left + document.body.scrollLeft, r.top+document.body.scrollTop, r.width, r.height);
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
                // console.info("Called getBannerPosCallback");
                modules.getBannerPos(function(x, y, w, h){
                    // console.info("left "+ x +" top " + y + " width "+ w +" height "+ h);
                    window.GuardianJSInterface.bannerAdsPosition(x, y, w, h);
                });
            },
            // Timer
            timer : function(time, yPos) {
                setTimeout(function() {
                    // console.log(time, yPos);
                    modules.runPoller(time, yPos);
                }, 1000);
            },
            // Count
            runPoller : function(start, yPos) {
                var thisNumber = parseInt(start, 10) + 1;
                var yPolled;
                if (thisNumber <= 20) { 
                    yPolled = modules.getMpuOffsetTop();
                    // console.info('y Polled position '+yPolled);
                    if (yPolled != yPos) {
                          modules.getMpuPos(function(x, y, w, h){
                            window.GuardianJSInterface.mpuAdsPosition(x, y, w, h);
                            // console.log("Changed slot Y axis position "+x+" "+y+" "+w+" "+h);
                        });
                    yPos = yPolled;  
                    // console.log("yPos is now set to be "+yPos);
                    }
                    modules.timer(thisNumber, yPos);
                }
            },
            // Poll for offSetTop position changes
            posPoller : function(y) {
                var yPos = y;
                // console.info('y Loaded position '+yPos);
                modules.runPoller(1, yPos);
            },
            getAds: function () {

                window.getMpuPosCallback = function (callbackNamespace, callbackFunction) {

                    var interactive  =  (document.getElementsByTagName("iframe")[0] || document.getElementsByClassName("interactive")[0]) ? true : false;

                    function onloadHandler () { 
                        modules.getMpuPos(function(x, y, w, h){
                            window.GuardianJSInterface.mpuAdsPosition(x, y, w, h);
                            // console.log("Initial slot position "+x+" "+y+" "+w+" "+h);
                        });  
                    }

                    function iframeHandler () {
                        modules.getMpuPos(function(x, y, w, h){
                            window.GuardianJSInterface.mpuAdsPosition(x, y, w, h);
                            // console.log("Initial slot position "+x+" "+y+" "+w+" "+h);
                            modules.posPoller(y);
                        });
                    }

                    var loadAds = (interactive === true) ? iframeHandler() : onloadHandler();

                };

                window.applyNativeFunctionCall("getMpuPosCallback");

            },
            // Timer
            iosTimer : function(time, yPos) {
                setTimeout(function() {
                    modules.runIosPoller(time, yPos);
                }, 1000);
            },
            // Count
            runIosPoller : function(start, yPos) {
                var thisNumber = parseInt(start, 10) + 1;
                var yPolled;
                if (thisNumber <= 1000) { 
                    yPolled = modules.getMpuOffsetTop();
                    window.logOnScreen('y Polled position '+yPolled);
                    if (yPolled != yPos) {
                        window.logOnScreen("Changed slot Y axis position");
                        window.location.href = 'x-gu://ad_moved';
                        yPos = yPolled;  
                        window.logOnScreen("yPos is now set to be "+yPos);
                    }
                    modules.iosTimer(thisNumber, yPos);
                }
            },
            // Poll for offSetTop position changes
            iosPoller : function(y) {
                var yPos = y;
                window.logOnScreen("Y position in PosPoller is "+y);
                modules.runIosPoller(1, yPos);
            },
            updateAdsIos: function () {
                var y;
                window.getMpuPosCommaSeparated = modules.getMpuPosCommaSeparated;
                y = modules.getMpuOffsetTop();
                window.logOnScreen("Y position "+y);
                modules.iosPoller(y);
            }
        },


        ready = function (config) {
            if (!this.initialised) {
                this.initialised = true;
                
                if (config.adsEnabled == "true") {
                    modules.insertAdPlaceholders(config);
                }
                window.getMpuPosJson = modules.getMpuPosJson;
                // window.getMpuPosCommaSeparated = modules.getMpuPosCommaSeparated; // Used by iOS
                window.getBannerPosCallback = modules.getBannerPosCallback; // Used by Android
                modules.getAds(); // Used by Android
                modules.updateAdsIos(); // Used by iOS
            }
        };

    return {
        init: ready
    };

});
