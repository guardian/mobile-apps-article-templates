/*global window,document,console,require,define,navigator */
define([
    'bean',
    'bonzo',
    'fence',
    'fastClick',
    'smoothScroll',
    'modules/comments',
    'modules/cards',
    'modules/more-tags',
    'modules/sharing',
    'modules/$'
], function (
    bean,
    bonzo,
    fence,
    FastClick,
    smoothScroll,
    Comments,
    Cards,
    MoreTags,
    Sharing,
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

        loadComments: function () {
            Comments.init();
        },

        loadCards: function() {
            Cards.init();
        },

        loadInteractives: function () {
            // Boot interactives
            var offline = function(){
                $('figure.interactive:not(.interactive--offline)')
                    .addClass('interactive--offline')
                    .append(bonzo.create('<a class="interactive--offline--icon interactive--offline--icon--reload" href="#" onclick="window.loadInteractives(true);return false;"></a>'))
                    .append(bonzo.create('<a class="interactive--offline--icon interactive--offline--icon--loading"></a>'));
                $('figure.interactive.interactive--loading').removeClass('interactive--loading');
            };

            window.loadInteractives = function (force) {
                if((!$('body').hasClass('offline') || force) && navigator.onLine ){
                    $('figure.interactive').each(function (el) {
                        var bootUrl = el.getAttribute('data-interactive');
                        // The contract here is that the interactive module MUST return an object
                        // with a method called 'boot'.
                        require.undef(bootUrl);
                        $(el).addClass('interactive--loading');
                        require([bootUrl], function (interactive) {
                            // We pass the standard context and config here, but also inject the
                            // mediator so the external interactive can respond to our events.
                            if(interactive && interactive.boot){
                                $(el).removeClass('interactive--offline');
                                interactive.boot(el, document.body);
                            }
                        }, offline);
                    });
                } else {
                    offline();
                }
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
                var figure,
                    isThumbnail,
                    hasCaption,
                    imageOrLinkedImage,
                    imageWrapper,
                    caption,
                    hasCaptionIcon,
                    imageClass;

                $('figure.element-image').each(function (el) {
                    figure = $(el);
                    isThumbnail = figure.hasClass("element--thumbnail");
                    //needed for live blogs when this populates every time loading in more articles
                    hasCaptionIcon = el.getElementsByClassName('figure__caption__icon').length;
                    caption = el.getElementsByClassName('element-image__caption');
                    hasCaption = caption.length;
                    imageOrLinkedImage = bonzo.firstChild(el);
                    imageClass = isThumbnail && hasCaption ? 'figure--thumbnail-with-caption' : (isThumbnail ? 'figure--thumbnail' : 'figure-wide');

                    figure.addClass(imageClass);

                    if (imageOrLinkedImage && !$(imageOrLinkedImage).hasClass('element__inner')) {
                       imageWrapper = document.createElement('div');
                       bonzo(imageWrapper).addClass('figure__inner').append(imageOrLinkedImage);
                       bonzo(el).prepend(imageWrapper);
                    }

                    if (hasCaption && !hasCaptionIcon) { 
                       bonzo(caption).prepend('<span data-icon="&#xe044;" class="figure__caption__icon" aria-hidden="true"></span>');
                    }

                });
                
            };
            window.articleImageSizer();
        },
        isThumbNailImageWithoutCaptionPresent: function(el){
            return el.getElementsByClassName('figure--thumbnail').length;
        },

        applyArticleContentTypeClasses: function(){
            var hasThumbnailsWithCaps,
                classArray;
        
            $(".prose").each(function(el){
                var element = $(el);
                classArray = [];
                hasThumbnailsWithCaps = modules.isThumbNailImageWithoutCaptionPresent(el);
                if (hasThumbnailsWithCaps) {
                    classArray.push('prose--has-thumbnails-without-caps');
                } 
                if (classArray.length) {
                    element.addClass(classArray.join(" ")); 
                }
            });          
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
                        var tabId = tab.attr("id");

                        $(activeTab.attr('href')).hide();
                        activeTab.attr("aria-selected", false);

                        $(tab.attr('href')).show();
                        tab.attr("aria-selected", true);

                        switch(tabId) {
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
                            case "cricket__tab--liveblog":
                            case "cricket__tab--stats":
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
            modules.applyArticleContentTypeClasses();
            modules.insertTags();
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
            Sharing.init(window);

            if (!document.body.classList.contains('no-ready')) {
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