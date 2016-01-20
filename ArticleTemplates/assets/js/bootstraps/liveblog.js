/*global window,console,define */
define([
    'bean',
    'bonzo',
    'modules/relativeDates',
    'modules/$',
    'modules/twitter'

], function (
    bean,
    bonzo,
    relativeDates,
    $,
    twitter
) {
    'use strict';

    var modules = {
            blockUpdates: function () {
                console.log("** liveMore");
                
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
                console.log("** liveMore");

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
            }
        },

        ready = function () {
            if (!this.initialised) {
                this.initialised = true;
                modules.setupGlobals();
                window.liveblogTime();
                modules.blockUpdates();
                modules.liveMore();
                setInterval(window.liveblogTime, 30000);
                twitter.init();
                twitter.enhanceTweets();
                // console.info("Liveblog ready");
            }
        };

    return {
        init: ready
    };
});