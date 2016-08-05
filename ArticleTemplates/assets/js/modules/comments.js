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
            setupGlobals: function () {
                // Function that loops through comments, hides replies and enables interactivity for comments
                window.commentsReplyFormatting = function () {
                    var counter = 0;
                    var stopPropagation = 0;

                    $(".block--discussion-thread").each(function(el) {
                        if (!$(this).hasClass("block--discussion-thread--checked")) {
                            if (typeof $(this)[0].children[4] !== "undefined") {
                                var blockID = "div[id='" + $(this)[0].children[3].id + "']";
                                var numOfComments = $(this)[0].children.length - 4;
                                if (numOfComments == 1) {
                                    $(this).addClass("block--discussion-thread--orphan");
                                } else {
                                    $(blockID).after('<div class="more more--comments"><a class="more__label"><span class="more__icon" data-icon="&#xe050;" aria-hidden="true"></span><span class="more__text">' + numOfComments + ' more replies</span></a></div>');
                                }
                            }
                        }
                        $(this).addClass("block--discussion-thread--checked");

                        bean.on(el, 'click', '.more--comments', function () {
                            $(this).hide();
                            $(this).parent().addClass("expand");
                        });
                    });

                    $(".comment").each(function(el) {

                        bean.on(el, 'click', 'a, .more--comments, .comment__reply, .comment__recommend', function (event) {
                            stopPropagation = 1;
                        });

                        bean.on(el, 'click', '.comment__header, .comment__body', function (event) {
                            stopPropagation = 0;
                        });

                        bean.on(el, 'click', function () {
                            if (stopPropagation === 0) {
                                var block = $(el);
                                // If comment is replyable allow buttons
                                if (block.hasClass('visible')) {
                                    // Evaluate if this comment is open or not
                                    if (block.hasClass("comment--open")) {
                                        // Hide the buttons
                                        block.removeClass("comment--open");
                                    } else {
                                        // Hide previously opened block
                                        $(".comment--open").removeClass("comment--open");
                                        block.addClass('comment--open');
                                    }
                                }
                            }
                        });
                    });
                };
                // Global functions to handle comments, called by native code
                window.articleCommentsInserter = function (html) {
                    $('.comments__block--loading').hide();
                    if (!html) {
                        $('.comments__block--empty').show();
                    } else {
                        html = bonzo.create(html);
                        $(html).appendTo('.comments__container');
                        window.commentsReplyFormatting();
                    }
                };
                window.commentsInserter = function (html) {
                    if (!html) {
                        $('.comments__block--empty').show();
                        $('.comments__block--loading').hide();
                    } else {
                        html = bonzo.create(html);
                        $(html).appendTo($('.comments__container'));
                        window.commentsReplyFormatting();
                    }
                    $('.comments__block--loading').appendTo($('.comments__container'));
                };
                window.articleCommentsFailed = function () {
                    $('.comments__block--failed').show();
                    $('.comments__block--loading').hide();
                    $('.comments').addClass('comments-has-failed');
                };
                window.commentsFailed = function () {
                    $('.comments__block--loading').hide();
                    $('.comments__block--failed').show();
                    $('.comments').addClass('comments-has-failed');
                };
                window.commentsEnd = function () {
                    $('.comments__block--loading').remove();
                };
                window.commentsClosed = function () {
                    $(".comments, #discussion").addClass("comments--closed");
                };
                window.commentsOpen = function () {
                    $(".comments, #discussion").addClass("comments--open");
                };
                window.commentTime = function () {
                    relativeDates.init('.comment__timestamp', 'title');
                };

                // Functions for feedback on recommend buttons
                window.commentsRecommendIncrease = function (id, number) {
                    var target = 'div[id="' + id + '"] .comment__recommend';
                    $(target).addClass('increase');
                    $(target + ' .comment__recommend__count').text(number);
                };
                window.commentsRecommendDecrease = function (id, number) {
                    var target = 'div[id="' + id + '"] .comment__recommend';
                    $(target).removeClass('increase');
                    $(target + ' .comment__recommend__count').text(number);
                };
                window.applyNativeFunctionCall('articleCommentsInserter');
                window.applyNativeFunctionCall('commentsInserter');
                window.applyNativeFunctionCall('commentsFailed');
                window.applyNativeFunctionCall('commentsClosed');
                window.applyNativeFunctionCall('commentsOpen');
                window.applyNativeFunctionCall('articleCommentsFailed');
            }
        },

        ready = function () {
            if (!this.initialised) {
                this.initialised = true;
                modules.setupGlobals();
                window.commentTime();
                // console.info("Comments ready");
            }
        };

    return {
        init: ready,
        modules: modules
    };

});