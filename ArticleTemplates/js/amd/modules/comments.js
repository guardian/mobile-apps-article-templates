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
                $('.discussion').each(function (el) {
                    var block = $(el);
                    if (block.hasClass('checked') === false) {
                        if (block.hasClass('is-response')) {
                            counter += 1;
                            if (counter === 4) {
                                $('.discussion__body', block.previous()).append("<div class='comments__view-more'><span class='icon'>&#xe002;</span> View more replies</div>");
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
                                $('.comments-open .discussion__options').toggle();
                                $('.comments-open').removeClass('comments-open');
                            }
                            block.toggleClass('comments-open');
                            $('.discussion__options', el).toggle(null, 'block');
                        }
                    });

                    bean.on(el, 'click', '.comments__view-more', function () {
                        var viewMore = $(el);
                        $(el).hide();
                        $('.discussion').each(function () {
                            if (viewMore.hasClass('is-response')) {
                                viewMore.show();
                            } else {
                                return false;
                            }
                        });
                    });

                    bean.on(el, 'click', 'a, .comments__view-more, .discussion__reply, .discussion__recommend', function (event) {
                        if (this.tagName.toLowerCase() === 'a' || $(this).hasClass('comments__view-more discussion__reply discussion__recommend')) {
                            event.stopPropagation();
                        }
                    });
                });
            },

            setupGlobals: function () {
                // Global function to handle comments, called by native code
                window.articleCommentsInserter = function (html) {
                    if (!html) {
                        $('.comments__empty').show();
                        $('.comments__loading').hide();
                    } else {
                        $('.comments__loading').hide();
                        html = bonzo.create(html);
                        $(html).appendTo($('#comments'));
                    }
                };
                window.articleCommentsFailed = function () {
                    $('.comments__failed').show();
                    $('.comments__loading').hide();
                    $('#module-comments').addClass('comments-has-failed');
                };
                window.commentsFailed = function () {
                    $('.comments__loading').hide();
                    $('.comments__failed').show();
                    $('#comments').addClass('comments-has-failed');
                };
                window.commentsEnd = function () {
                    $('.comments__loading').remove();
                };
                window.commentsInserter = function (html) {
                    if (!html) {
                        $('.comments__empty').show();
                        $('.comments__loading').hide();
                    } else {
                        html = bonzo.create(html);
                        $(html).appendTo($('.article__body--comments'));
                    }
                    $('.comments__loading').appendTo('.article__body--comments');
                };
                window.commentsRecommendIncrease = function (id, number) {
                    var target = '#' + id + ' .discussion__recommend';
                    $(target).addClass('increase');
                    $(target + ' .discussion__recommend__count').text(number);
                };
                window.commentsRecommendDecrease = function (id, number) {
                    var target = '#' + id + ' .discussion__recommend';
                    $(target).removeClass('increase');
                    $(target + ' .discussion__recommend__count').text(number);
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
