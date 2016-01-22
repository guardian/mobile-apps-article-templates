/*global window,console,define */
define([
    'bean',
    'bonzo',
    'modules/relativeDates',
    'modules/$',
    'modules/twitter',
    'modules/MyScroll'
], function (
    bean,
    bonzo,
    relativeDates,
    $,
    twitter,
    MyScroll
) {
    'use strict';

    var modules = {
            blockUpdates: function () {
                var newBlockHtml = '',
                    updateCounter = 0,
                    liveblogStartPos = $('.article__body--liveblog').offset(),

                    liveblogNewBlockDump = function () {
                        newBlockHtml = bonzo.create(newBlockHtml);
                        $(newBlockHtml).each(function() {
                            $(this).addClass("animated slideinright");
                        });
                        $(".article__body--liveblog__pinned").after(newBlockHtml);

                        // See Common bootstrap
                        window.articleImageSizer();
                        window.liveblogTime();
                        window.loadEmbeds();
                        window.loadInteractives();
                        newBlockHtml = '';
                    };

                window.liveblogNewBlock = function (html) {
                    newBlockHtml = html + newBlockHtml;
                    if (liveblogStartPos.top > window.scrollY) {
                        liveblogNewBlockDump();
                    }
                };

                window.applyNativeFunctionCall('liveblogNewBlock');

                bean.on(window, 'scroll', function () {
                    if (liveblogStartPos.top > window.scrollY) {
                        liveblogNewBlockDump();
                    }
                });
            },

            liveMore: function () {
                if($('.more--live-blogs')[0]){
                    bean.on($('.more--live-blogs')[0], 'click', function () {
                        $(this).hide();
                        $('.loading--liveblog').addClass("loading--visible");
                        window.location.href = 'x-gu://showmore';
                    });
                }
            },

            setupGlobals: function () {
                // Global function to handle liveblogs, called by native code
                window.liveblogDeleteBlock = function (blockID) {
                    console.log("** liveblogDeleteBlock");

                    $('#' + blockID).remove();
                };

                window.liveblogUpdateBlock = function (blockID, html) {
                    console.log("** liveblogUpdateBlock");

                    $("#" + blockID).replaceWith(html);
                };

                window.liveblogLoadMore = function (html) {
                    console.log("** liveblogLoadMore");

                    html = bonzo.create(html);
                    $('.loading--liveblog').removeClass("loading--visible");
                    $(html).appendTo('.article__body');

                    // See Common bootstrap
                    window.articleImageSizer();
                    window.liveblogTime();
                    window.loadEmbeds();
                    window.loadInteractives();
                };

                window.liveblogTime = function () {
                    console.log("** liveblogTime");

                    if ($(".tone--liveBlog").hasClass("is-live")) {
                        relativeDates.init('.block__time', 'title');
                    } else {
                        $('.block__time').each(function (el) {
                            $(el).html(el.getAttribute('title'));
                        });
                    }
                };

                window.showLiveMore = function (show) {
                    console.log("** showLiveMore");

                    if (show) {
                        $('.more--live-blogs').show();
                    } else {
                        $('.more--live-blogs').hide();
                    }
                };

                window.applyNativeFunctionCall('liveblogDeleteBlock');
                window.applyNativeFunctionCall('liveblogUpdateBlock');
            },

            initScroller: function () {
                var scroller,
                    minuteNavElem = document.body.querySelector(".the-minute__nav"),
                    wrapperElem = document.body.querySelector(".article--liveblog"),
                    liveblogElem = wrapperElem.querySelector(".article__body--liveblog"),
                    options = {
                        scrollX: false,
                        scrollY: true,
                        momentum: false,
                        snap: true,
                        bounce: false,
                        snapSpeed: 600
                    };

                // liveblogElem must be first child of wrapperElem
                wrapperElem.insertBefore(liveblogElem, wrapperElem.children[0]);

                modules.setScrollDimensions(liveblogElem);

                // initialise scroller
                scroller = new MyScroll(wrapperElem, options);

                // onScrollEnd show hide minuteNavElem
                scroller.on('scrollEnd', modules.onScrollEnd.bind(null, minuteNavElem, scroller));

                // add touch event handler to minuteNavElem
                minuteNavElem.addEventListener('touchend', modules.scrollToNextCard.bind(null, minuteNavElem, scroller));
            
                // update scroll dimensions on orientation change
                bean.on(window, 'resize', modules.setScrollDimensions.bind(null, liveblogElem));
            },

            setScrollDimensions: function (liveblogElem) {
                var i,
                    elemHeight,
                    scroller,
                    scrollHeight = 0,
                    windowHeight = window.innerHeight;

                // set heights of each card within scroller
                for (i = 0; i < liveblogElem.children.length; i++) {
                    elemHeight = liveblogElem.children[i].offsetHeight;
                    
                    if (elemHeight) {
                        scrollHeight += windowHeight;
                        liveblogElem.children[i].style.height = windowHeight + "px";
                    }
                }

                // set height of scrollable area
                liveblogElem.style.height = scrollHeight + "px";
            },           

            scrollToNextCard: function (minuteNavElem, scroller, evt) {
                if ((scroller.currentPage.pageY + 1) !== scroller.pages[0].length) {
                    scroller.next();
                    modules.onScrollEnd(minuteNavElem, scroller);
                }
            },

            onScrollEnd: function (minuteNavElem, scroller) {
                if ((scroller.currentPage.pageY + 1) === scroller.pages[0].length) {
                    minuteNavElem.classList.add("hide");
                } else {
                    minuteNavElem.classList.remove("hide");
                }
            }
        },

        ready = function () {
            if (!this.initialised) {
                this.initialised = true;
                modules.setupGlobals();
                window.liveblogTime();
                modules.blockUpdates();
                modules.liveMore();
                if ($('body').hasClass('the-minute')) {
                    // do any "the minute" js here
                    modules.initScroller();
                } else {
                    setInterval(window.liveblogTime, 30000);
                    $('.the-minute__header, .the-minute__nav').remove();
                }
                twitter.init();
                twitter.enhanceTweets();
                // console.info("Liveblog ready");
            }
        };

    return {
        init: ready
    };
});