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

        loadAdverts: function (config) {
            // Setup ad tags, insert containers
            Ads.init(config);
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
            // Boot Fenced Embeds
            window.loadEmbeds = function () {
                require(['fence'], function(fence) {
                    $("iframe.fenced").each(function(node) {
                        fence.render(node);
                    });
                });
                
            };
            window.loadEmbeds();
        },

        scrollToAnchor: function () {
            window.smoothScroll.init();
        },

        imageSizer: function () {
            // Resize figures to fit images
            window.articleImageSizer = function () {
                $('figure > img').each(function (el) {
                    var imageWidth = el.getAttribute('width') || $(el).dim().width,
                        imageClass = imageWidth < 301 ? 'figure-inline' : 'figure-wide',
                        parent = $(el).parent();
                    console.log("Images");
                    parent.addClass(imageClass);
                    if (parent.hasClass('figure-inline')) {
                        // Can this class only come from the above?
                        parent.css('width', imageWidth);
                    }
                });
            };
            window.articleImageSizer();
        },

        figureClassCheck: function () {
            // Check for figure-wide class, add if not present
            var el = $('figure');

            if (!el.hasClass('figure-wide')) {
                el.addClass("figure-wide");
            }

        },

        insertTags: function () {
            // Tag Function
            window.articleTagInserter = function (html) {
                html = bonzo.create(html);
                $(html).appendTo('.tags .inline-list');
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
            };
        },

        setupOfflineSwitch: function() {
            // Function that allows templates to better handle offline, called by native code
            window.offlineSwitch = function () {
                $(document.body).addClass("offline");
            };
        },

        showTabs: function () {
            // Set up tab events, show only first child
            $('.tabs a').each(function (el, i) {
                var tabGroup = el.getAttribute('href');
                if (i > 0) {
                    $(tabGroup).hide();
                }
                bean.on(el, 'click', function (e) {
                    e.preventDefault();

                    $($('[aria-selected="true"]').attr('href')).hide();
                    $('[aria-selected="true"]').attr("aria-selected", false);

                    $($(this).attr('href')).show();
                    $(this).attr("aria-selected", true);
                });
            });
        }
    },

    ready = function (config) {
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
            modules.figureClassCheck();
            modules.insertTags();
            modules.loadAdverts(config);
            modules.loadComments();
            modules.loadCards();
            modules.loadEmbeds();
            modules.scrollToAnchor();
            modules.loadInteractives();
            modules.offline();
            modules.setupOfflineSwitch();
            modules.setupAlertSwitch();
            modules.setupFontSizing();
            modules.showTabs();
            if (!$("body").hasClass("no-ready")) {
                window.location.href = 'x-gu://ready';
            }
            // console.info("Common ready");
        }
    };

    return {
        init: ready
    };
});