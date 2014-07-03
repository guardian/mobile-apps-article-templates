/*global window,console,define */
define([
    'bean',
    'bonzo',
    'modules/relativeDates',
    'modules/$'
], function (
    bean,
    bonzo,
    relativeDates,
    $
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
                bean.on($('.more--live-blogs')[0], 'click', function () {
                    $(this).hide();
                    $('.loading--liveblog').addClass("loading--visible");
                    window.location.href = 'x-gu://showmore';
                });
            },

            setupGlobals: function () {
                // Global function to handle liveblogs, called by native code
                window.liveblogDeleteBlock = function (blockID) {
                    $('#' + blockID).remove();
                };

                window.liveblogUpdateBlock = function (blockID, html) {
                    $("#" + blockID).replaceWith(html);
                };

                window.liveblogLoadMore = function (html) {
                    html = bonzo.create(html);
                    $('.loading--liveblog').removeClass("loading--visible");
                    $(html).each(function() {
                        $(this).addClass("animated slideinright");
                    });
                    $(html).appendTo('.article__body');

                    // See Common bootstrap
                    window.articleImageSizer();
                    window.liveblogTime();
                    window.loadEmbeds();
                    window.loadInteractives();
                };

                window.liveblogTime = function () {
                    if ($(".tone--liveBlog").hasClass("is-live")) {
                        relativeDates.init('.block__time', 'title');
                    } else {
                        $('.block__time').each(function (el) {
                            $(el).html(el.getAttribute('title'));
                        });
                    }
                };

                window.showLiveMore = function (show) {
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
                // console.info("Liveblog ready");
            }
        };

    return {
        init: ready
    };
});