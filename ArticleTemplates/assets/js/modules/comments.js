/*global window,console,define */
define([
    'bean',
    'bonzo',
    'modules/relativeDates',
    'modules/$'
], function(
    bean,
    bonzo,
    relativeDates,
    $
) {
    'use strict';

    var initialised = false;

    function setupGlobals() {
        window.articleCommentsInserter = articleCommentsInserter;
        window.commentsInserter = commentsInserter;
        window.articleCommentsFailed = articleCommentsFailed;
        window.commentsFailed = commentsFailed;
        window.commentsEnd = commentsEnd;
        window.commentsClosed = commentsClosed;
        window.commentsOpen = commentsOpen;
        window.commentTime = commentTime;
        window.commentsRecommendIncrease = commentsRecommendIncrease;
        window.commentsRecommendDecrease = commentsRecommendDecrease;

        window.applyNativeFunctionCall('articleCommentsInserter');
        window.applyNativeFunctionCall('commentsInserter');
        window.applyNativeFunctionCall('commentsFailed');
        window.applyNativeFunctionCall('commentsClosed');
        window.applyNativeFunctionCall('commentsOpen');
        window.applyNativeFunctionCall('articleCommentsFailed');
    }

    function commentsReplyFormatting() {
        var comments = document.getElementsByClassName('comment'),
            discussionThread,
            discussionThreads = document.getElementsByClassName('block--discussion-thread'),
            i,
            moreCommentsButton,
            numOfComments;

        for (i = 0; i < discussionThreads.length; i++) {
            discussionThread = discussionThreads[i];

            if (!discussionThread.classList.contains('block--discussion-thread--checked') &&
                discussionThread.children &&
                discussionThread.children.length >= 5) {

                numOfComments = discussionThread.children.length - 4;

                if (numOfComments === 1) {
                    discussionThread.classList.add("block--discussion-thread--orphan");
                } else {
                    moreCommentsButton = document.createElement('div');
                    moreCommentsButton.classList.add('more');
                    moreCommentsButton.classList.add('more--comments');
                    moreCommentsButton.innerHTML = '<a class="more__label"><span class="more__icon" data-icon="&#xe050;" aria-hidden="true"></span><span class="more__text">' + numOfComments + ' more replies</span></a>';
                    moreCommentsButton.addEventListener('click', handleMoreCommentsClick);
                    discussionThread.children[4].parentNode.insertBefore(moreCommentsButton, discussionThread.children[4]);
                }
            }

            discussionThread.classList.add('block--discussion-thread--checked');
        }

        for (i = 0; i < comments.length; i++) {
            comments[i].addEventListener('click', handleCommentClick.bind(null, comments[i]));
        }
    }

    function handleMoreCommentsClick(evt) {
        var moreCommentsButton = evt.target;

        moreCommentsButton.style.display = 'none';
        moreCommentsButton.parentNode.classList.add('expand');

        evt.stopPropagation();
    }

    function handleCommentClick(comment, evt) {
        var i,
            classList = [],
            openComments;

        for (i = 0; i < evt.target.classList.length; i++) {
            classList.push(evt.target.classList[i]);
        }

        if (evt.target.tagName === 'A' || targetContainsBlackListedClass(classList)) {
            evt.stopPropagation();
        } else if (comment.classList.contains('visible')) {
            if (comment.classList.contains('comment--open')) {
                comment.classList.remove('comment--open')
            } else {
                openComments = document.getElementsByClassName('comment--open');

                for (i = 0; i < openComments.length; i++) {
                    openComments[i].classList.remove('comment--open');
                }

                comment.classList.add('comment--open')
            }
        }
    }

    function targetContainsBlackListedClass(classList) {
        var stopPropagationBlackList = ['more--comments', 'comment__reply', 'comment__recommend'];

        return stopPropagationBlackList.some(function (v) {
            return classList.indexOf(v) >= 0;
        });
    }

    function articleCommentsInserter(html) {
        $('.comments__block--loading').hide();
        if (!html) {
            $('.comments__block--empty').show();
        } else {
            html = bonzo.create(html);
            $(html).appendTo('.comments__container');
            commentsReplyFormatting();
        }
    }

    function commentsInserter(html) {
        if (!html) {
            $('.comments__block--empty').show();
            $('.comments__block--loading').hide();
        } else {
            html = bonzo.create(html);
            $(html).appendTo($('.comments__container'));
            commentsReplyFormatting();
        }
        $('.comments__block--loading').appendTo($('.comments__container'));
    }

    function articleCommentsFailed() {
        $('.comments__block--failed').show();
        $('.comments__block--loading').hide();
        $('.comments').addClass('comments-has-failed');
    }

    function commentsFailed() {
        $('.comments__block--loading').hide();
        $('.comments__block--failed').show();
        $('.comments').addClass('comments-has-failed');
    }

    function commentsEnd() {
        $('.comments__block--loading').remove();
    }

    function commentsClosed() {
        $(".comments, #discussion").addClass("comments--closed");
    }

    function commentsOpen() {
        $(".comments, #discussion").addClass("comments--open");
    }

    function commentTime() {
        relativeDates.init('.comment__timestamp', 'title');
    }

    function commentsRecommendIncrease(id, number) {
        var target = 'div[id="' + id + '"] .comment__recommend';
        $(target).addClass('increase');
        $(target + ' .comment__recommend__count').text(number);
    }

    function commentsRecommendDecrease(id, number) {
        var target = 'div[id="' + id + '"] .comment__recommend';
        $(target).removeClass('increase');
        $(target + ' .comment__recommend__count').text(number);
    }

    function ready() {
        if (!initialised) {
            initialised = true;
            setupGlobals();
            commentTime();
        }
    }

    return {
        init: ready
    };

});