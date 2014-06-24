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
            setupGlobals: function () {
                // Function that loops through comments, hides replies and enables interactivity for comments
                window.commentsReplyFormatting = function () {
                    var counter = 0;
                    var stopPropagation = 0;

                    $(".block--discussion-thread").each(function(el) {
                        if (!$(this).hasClass("block--discussion-thread--checked")) {
                            if (typeof $(this)[0].children[4] !== "undefined") {
                                var blockID = "#" + $(this)[0].children[3].id;
                                var numOfComments = $(this)[0].children.length - 4;
                                if (numOfComments == 1) {
                                    $(this).addClass("block--discussion-thread--orphan");
                                } else {
                                    $(blockID).append("<div class='more more--comments' data-icon='&#xe050;'>" + numOfComments + " more replies</div>");
                                }
                            }
                        }
                        $(this).addClass("block--discussion-thread--checked");
                    });

                    $(".comment").each(function(el) {

                        bean.on(el, 'click', 'a, .more--comments, .comment__reply, .comment__recommend', function (event) {
                            stopPropagation = 1;
                        });

                        bean.on(el, 'click', '.comment__header, .comment__body', function (event) {
                            stopPropagation = 0;
                        });

                        bean.on(el, 'click', function () {
                            if (stopPropagation == 0) {
                                var block = $(el);
                                // If comment is replyable allow buttons
                                if (block.hasClass('visible')) {
                                    // Remove any previous animation classes
                                    $(".comment__options").removeClass("animated fadeInRight");
                                    $(".comment__timestamp").removeClass("animated scaleOut");
                                    if (block.hasClass("comment--open")) {
                                        // Hide the buttons
                                        block.removeClass("comment--open");
                                    } else {
                                        // Hide previously opened block
                                        $(".comment--open").removeClass("comment--open");
                                        // Different animations for different block types
                                        if (block.hasClass("is-response")) {
                                            $(".comment__timestamp", el).addClass("animated scaleOut");
                                            $('.comment__options', el).addClass("animated fadeInRight");
                                        } else {
                                            // Calculate height to animate initial comments
                                            var originalHeight = block[0].clientHeight;
                                            // 110px is the smallest height an initial comment can be with options expanded
                                            if (originalHeight > 110) {
                                                block.css("min-height", originalHeight + 46);
                                            } else {
                                                block.css("min-height", "110px");
                                            }
                                            setTimeout(function() {
                                                $('.comment__options', el).addClass("animated fadeInRight");
                                                block.css("min-height", originalHeight);
                                            }, 350);
                                        }
                                        block.addClass('comment--open');
                                    }
                                }
                            }
                        });

                        bean.on(el, 'click', '.more--comments', function () {
                            $(this).hide();
                            $(this).parent().parent().addClass("expand");
                        });
                        
                    });
                };
                // Global functions to handle comments, called by native code
                window.articleCommentsInserter = function (html) {
                    $('.loading--discussion').hide();
                    if (!html) {
                        $('.block--discussion-empty').show();
                    } else {
                        html = bonzo.create(html);
                        $(html).appendTo($('#comments .container__body'));
                        commentsReplyFormatting();
                    }
                };
                window.commentsInserter = function (html) {
                    if (!html) {
                        $('.block--discussion-empty').show();
                        $('.loading--discussion').hide();
                    } else {
                        html = bonzo.create(html);
                        $(html).appendTo($('#comments .container__body'));
                        commentsReplyFormatting();
                    }
                    $('.loading--discussion').appendTo('#comments .container__body');
                };
                window.articleCommentsFailed = function () {
                    $('.block--discussion-failed').show();
                    $('.loading--discussion').hide();
                    $('#comments').addClass('comments-has-failed');
                };
                window.commentsFailed = function () {
                    $('.loading--discussion').hide();
                    $('.block--discussion-failed').show();
                    $('#comments .container__body').addClass('comments-has-failed');
                };
                window.commentsEnd = function () {
                    $('.loading--discussion').remove();
                };

                window.commentsClosed = function () {
                    $("#comments, #discussion").addClass("comments--closed");
                };
                
                // Functions for feedback on recommend buttons
                window.commentsRecommendIncrease = function (id, number) {
                    var target = '#' + id + ' .comment__recommend';
                    $(target).addClass('increase');
                    $(target + ' .comment__recommend__count').text(number);
                };
                window.commentsRecommendDecrease = function (id, number) {
                    var target = '#' + id + ' .comment__recommend';
                    $(target).removeClass('increase');
                    $(target + ' .comment__recommend__count').text(number);
                };
                window.scrollToComments = function () {
                    window.location.href = '#comments';
                };
                window.applyNativeFunctionCall('articleCommentsInserter');
                window.applyNativeFunctionCall('commentsFailed');
                window.applyNativeFunctionCall('commentsClosed');
                window.applyNativeFunctionCall('articleCommentsFailed');
            }
        },

        ready = function () {
            if (!this.initialised) {
                this.initialised = true;
                modules.setupGlobals();
                // console.info("Comments ready");
            }
        };

    return {
        init: ready
    };

});
