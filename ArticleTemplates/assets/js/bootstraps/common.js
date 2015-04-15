/*global window,document,console,require,define */
define([
    'bean',
    'bonzo',
    'fence',
    'fastClick',
    'smoothScroll',
    'modules/ads',
    'modules/comments',
    'modules/cards',
    'modules/more-tags',
    'modules/$'
], function (
    bean,
    bonzo,
    fence,
    FastClick,
    smoothScroll,
    Ads,
    Comments,
    Cards,
    MoreTags,
    $
) {
    'use strict';

    var modules = {
        attachFastClick: function () {
            // Polyfill to remove click delays on browsers with touch UIs
            FastClick.attach(document.body);
        },

        correctCaptions: function () {
            // Remove empty captions from figures
            $('figure').each(function (el) {
                var figcaption = $('figcaption', el);
                if (figcaption.length === 0 || figcaption.text() === '') {
                    figcaption.hide();
                    // $(el).css('border-bottom', 'none');
                }
            });
        },

        figcaptionToggle: function () {
            // Show/hides figure caption
            if ($('.main-media__caption__icon')[0]) {
                bean.on($('.main-media__caption__icon')[0], 'click', function () {
                    $('.main-media__caption__text').toggleClass('is-visible');
                });
            }
        },

        loadAdverts: function () {
            // Setup ad tags, insert containers
            Ads.init({
                adsEnabled: document.body.getAttribute('data-ads-enabled'),
                adsConfig: document.body.getAttribute('data-ads-config'),
                mpuAfterParagraphs: document.body.getAttribute('data-mpu-after-paragraphs')
            });
        },

        loadComments: function () {
            Comments.init();
        },

        loadCards: function() {
            Cards.init();
        },

        loadInteractives: function () {
            // Boot interactives
            window.loadInteractives = function () {
                $('figure.interactive').each(function (el) {
                    var bootUrl = el.getAttribute('data-interactive');
                    // The contract here is that the interactive module MUST return an object
                    // with a method called 'boot'.
                    require([bootUrl], function (interactive) {
                        // We pass the standard context and config here, but also inject the
                        // mediator so the external interactive can respond to our events.
                        interactive.boot(el, document.body);
                    });
                });
            };
            window.loadInteractives();
        },

        loadEmbeds: function() {

            window.loadEmbeds = function () {

                // Fix Wine Width
                modules.fixVineWidth();

                // Boot Fenced Embeds
                require(['fence'], function(fence) {
                    $("iframe.fenced").each(function(node) {
                        fence.render(node);
                    });
                });

            };
            window.loadEmbeds();
        },

        scrollToAnchor: function () {
            smoothScroll.init();
        },

        imageSizer: function () {
            // Resize figures to fit images
            window.articleImageSizer = function () {
                $('figure img').each(function (el) {
                    // var el = el;
                    var parent;
                    var imageWidth = el.getAttribute('width') || $(el).dim().width,
                        imageClass = imageWidth < 301 ? 'figure-inline' : 'figure-wide';
                    // NB No parents() or closest() with Bonzo, so I'm using pure JavaScript
                    // to detect where Figure element is (either up one or two parent nodes)
                    parent = el.parentNode.parentNode.nodeName === "FIGURE" ? $(el).parent().parent() : $(el).parent();
                    parent.addClass(imageClass);
                    if (parent.hasClass('figure-inline')) {
                        parent.css('width', imageWidth);
                    } else if (parent.hasClass('figure-wide')) {
                        $(el).css('width', "100%");
                    }
                });
            };
            window.articleImageSizer();
        },

        insertTags: function () {
            // Tag Function
            window.articleTagInserter = function (html) {
                setTimeout(modules.showMoreTags, 0);
                html = bonzo.create(html);
                $(html).appendTo('.tags .inline-list');
                MoreTags.refresh();
            };
            window.applyNativeFunctionCall('articleTagInserter');
        },

        offline: function() {
            // Function that gracefully fails when the device is offline
            if ($(document.body).hasClass('offline')) {
                $(".article img").each(function() {
                    var element = $(this);
                    var img = new Image();
                    img.onerror = function() {
                        if ($(element).parent().attr("class") == "element-image-inner") {
                            $(element).hide();
                        } else {
                            $(element).replaceWith("<div class='element-image-inner'></div>");
                        }
                    };
                    img.src = $(this).attr("src");
                });
            }
        },

        setupAlertSwitch: function () {
            // Global function to switch follow alerts, called by native code
            window.alertSwitch = function (following, followid) {
                var followObject = $('[data-follow-alert-id="' + followid + '"]');
                if (followObject.length) {
                    if (following == 1) {
                        if (followObject.hasClass('following') === false) {
                            followObject.addClass('following');
                        }
                    } else {
                        if (followObject.hasClass('following')) {
                            followObject.removeClass('following');
                        }
                    }
                }
            };
        },

        setupFontSizing: function () {
            // Global function to resize font, called by native code
            window.fontResize = function (current, replacement) {
                $(document.body).removeClass(current).addClass(replacement);
                var replacementStr = replacement;
                var replacementInt = replacementStr.split("-");
                document.body.setAttribute("data-font-size", replacementInt[2]);
            };
        },

        setupOfflineSwitch: function() {
            // Function that allows templates to better handle offline, called by native code
            window.offlineSwitch = function () {
                $(document.body).addClass("offline");
            };
        },

        showTabs: function (root) {
            // Set up tab events, show only first child
            var tabContainer = $('.tabs');
            var tabs = $('a',tabContainer);

            tabs.each(function(tab,i) {
                if (i > 0) {
                    $(tab.getAttribute('href')).hide();    
                }
            });

            if(tabContainer[0]){
                bean.on(tabContainer[0], 'click', 'a', function (e) {

                    e.preventDefault();                
                    var tab = $(this);

                    if( tab.attr("aria-selected") !== 'true' ) {
                     
                        var activeTab = $('[aria-selected="true"]', tabContainer);
                        $(activeTab.attr('href')).hide();
                        activeTab.attr("aria-selected", false);

                        $(tab.attr('href')).show();
                        tab.attr("aria-selected", true);

                        switch(tab.attr("id")) {
                            case "football__tab--article":
                                root.location.href = 'x-gu://football_tab_report';
                                break;
                            case "football__tab--stats":
                                modules.setPieChartSize();                        
                                root.location.href = 'x-gu://football_tab_stats';
                                break;
                            case "football__tab--liveblog":
                                root.location.href = 'x-gu://football_tab_liveblog';
                                break;
                            default:
                                root.location.href = 'x-gu://football_tab_unknown';
                        }
                    }
                });
            }
        },

        setPieChartSize: function (){
            var piechart = $('.pie-chart');
            var parent = piechart.parent().offset();
            piechart.css({
                'width': parent.width,
                'height': parent.width
            });
        },

        fixVineWidth: function (container) {
            var iframes = $('iframe[srcdoc*="https://vine.co"]:not([data-vine-fixed])',container);
            iframes.each(function(iframe){
                var size = iframe.parentNode.clientWidth;
                var $iframe = $(iframe);
                var srcdoc = $iframe.attr('srcdoc');
                srcdoc = srcdoc.replace(/width="[\d]+"/,'width="' + size + '"');
                srcdoc = srcdoc.replace(/height="[\d]+"/,'height="' + size + '"');
                $iframe.attr('srcdoc', srcdoc);
                $iframe.attr('data-vine-fixed', true);
            });
        },

        setGlobalObject: function (root) {
            var pageId = $('body').attr('data-page-id');

            root.guardian = {
                config: {
                    page: {
                        pageId: pageId === '__PAGE_ID__' ? null : pageId
                    }
                }
            };

            return root.guardian;
        },

        fixSeries: function () {
            var series = $('.content__series-label.content__labels a');
            series.html('<span>' + series.text().split(/\s+/).join(' </span><span>') + ' </span>');
            
            var spans = $('span', series);
            var size = spans.length;
            var lineWidth = 0;
            var minLastLineWidth = 80; //px

            for(var x = size - 1; x >=0; x--){
                lineWidth = lineWidth + spans[x].offsetWidth;
                if( lineWidth > minLastLineWidth) {
                    if( Math.abs(spans[x].getBoundingClientRect().top - spans[size - 1].getBoundingClientRect().top) >= spans[x].offsetHeight ){
                        bonzo(spans[x]).before('</br>');
                    }
                    break;
                }
            }
        }
    },

    ready = function () {
        if (!this.initialised) {
            this.initialised = true;

            /*
             These methods apply to all templates, if any should
             only run for articles, move to the Article bootstrap.
            */

            modules.attachFastClick();
            modules.correctCaptions();
            modules.figcaptionToggle();
            modules.imageSizer();
            modules.insertTags();
            modules.loadAdverts();
            modules.loadComments();
            modules.loadCards();
            modules.loadEmbeds();
            modules.scrollToAnchor();
            modules.loadInteractives();
            modules.offline();
            modules.setupOfflineSwitch();
            modules.setupAlertSwitch();
            modules.setupFontSizing();
            modules.showTabs(window);
            modules.setGlobalObject(window);
            modules.fixSeries();

            if (!$("body").hasClass("no-ready")) {
                window.location.href = 'x-gu://ready';
            }
        }
    };

    return {
        init: ready,
        // export internal functions for testing purpouse
        modules: modules
    };
});