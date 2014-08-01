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

            // return the current MPU's position .
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
            }
        },


        ready = function (config) {
            if (!this.initialised) {
                this.initialised = true;
                
                if (config.adsEnabled == "true") {
                    modules.insertAdPlaceholders(config);
                }
                window.getMpuPosJson = modules.getMpuPosJson;
                window.getMpuPosCommaSeparated = modules.getMpuPosCommaSeparated;
                // console.info("Ads ready");
            }
        };

    return {
        init: ready
    };

});
