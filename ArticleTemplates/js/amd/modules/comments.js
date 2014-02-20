/*global window,console,define */
define([
    'bean',
    'bonzo',
    'modules/$'
], function (
    bean,
    bonzo,
    $
) {
    'use strict';

    var modules = {
            commentsReplyFormatting: function () {
                var counter = 0;
                $('.comments-block').each(function (el) {
                    var block = $(el);
                    if (block.hasClass('checked') === false) {
                        if (block.hasClass('is-response')) {
                            counter += 1;
                            if (counter === 4) {
                                $('.comments-body', block.previous()).append("<div class='comments-view-more'><span class='icon'>&#xe002;</span> View more replies</div>");
                            }
                            if (counter > 3) {
                                block.hide().addClass('comments-hidden');
                            }
                        } else {
                            counter = 0;
                        }
                        block.addClass('checked');
                    }

                    bean.on(el, 'click', function () {
                        block = $(el);
                        if (block.hasClass('visible')) {
                            if (block.hasClass('comments-open') === false) {
                                $('.comments-open .comments-options').toggle();
                                $('.comments-open').removeClass('comments-open');
                            }
                            block.toggleClass('comments-open');
                            $('.comments-options', el).toggle(null, 'block');
                        }
                    });

                    bean.on(el, 'click', '.comments-view-more', function () {
                        var viewMore = $(el);
                        $(el).hide();
                        $('.comments-block').each(function () {
                            if (viewMore.hasClass('is-response')) {
                                viewMore.show();
                            } else {
                                return false;
                            }
                        });
                    });

                    bean.on(el, 'click', 'a, .comments-view-more, .comments-options-reply, .comments-recommends-container', function (event) {
                        if (this.tagName.toLowerCase() === 'a' || $(this).hasClass('comments-view-more comments-options-reply comments-recommends-container')) {
                            event.stopPropagation();
                        }
                    });
                });
            },

            setupGlobals: function () {
                // Global function to handle comments, called by native code
                window.articleCommentsInserter = function (html) {
                    if (!html) {
                        $('.comments-empty').show();
                        $('.comments-loading').hide();
                    } else {
                        $('.comments-loading').hide();
                        html = bonzo.create(html);
                        $(html).appendTo($('#comments'));
                    }
                };
                window.articleCommentsFailed = function () {
                    $('.comments-failed').show();
                    $('.comments-loading').hide();
                    $('#module-comments').addClass('comments-has-failed');
                };
                window.commentsFailed = function () {
                    $('.comments-loading').hide();
                    $('.comments-failed').show();
                    $('#comments').addClass('comments-has-failed');
                };
                window.commentsEnd = function () {
                    $('.comments-loading').remove();
                };
                window.commentsInserter = function (html) {
                    if (!html) {
                        $('.comments-empty').show();
                        $('.comments-loading').hide();
                    } else {
                        html = bonzo.create(html);
                        $(html).appendTo($('.comments-container'));
                    }
                    $('.comments-loading').appendTo('.comments-container');
                };
                window.commentsRecommendIncrease = function (id, number) {
                    var target = '#' + id + ' .comments-recommends-container';
                    $(target).addClass('increase');
                    $(target + ' .comments-recommends-count').text(number);
                };
                window.commentsRecommendDecrease = function (id, number) {
                    var target = '#' + id + ' .comments-recommends-container';
                    $(target).removeClass('increase');
                    $(target + ' .comments-recommends-count').text(number);
                };
                window.scrollToComments = function () {
                    window.location.href = '#module-comments';
                };
                window.applyNativeFunctionCall('articleCommentsInserter');
                window.applyNativeFunctionCall('commentsFailed');
            }
        },

        ready = function () {
            if (!this.initialised) {
                this.initialised = true;
                modules.commentsReplyFormatting();
                modules.setupGlobals();
                // console.info("Comments ready");
            }
        };

    return {
        init: ready
    };

});
