/*global window,define */
define([
    'modules/relativeDates'
], function(
    relativeDates
) {
    'use strict';

    var initialised = false;

    function setupGlobals() {
        window.articleCommentsInserter = articleCommentsInserter;
        window.commentsInserter = commentsInserter; // Almost the same as window.articleCommentsInserter - WHY?
        window.articleCommentsFailed = articleCommentsFailed;
        window.commentsFailed = articleCommentsFailed; // Exactly the same as window.articleCommentsFailed - WHY?
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
        var discussionThread,
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
                    discussionThread.classList.add('block--discussion-thread--orphan');
                } else {
                    moreCommentsButton = document.createElement('div');
                    moreCommentsButton.classList.add('more');
                    moreCommentsButton.classList.add('more--comments');
                    moreCommentsButton.innerHTML = '<a class="more__label"><span class="more__icon" data-icon="&#xe050;" aria-hidden="true"></span><span class="more__text">' + numOfComments + ' more replies</span></a>';
                    moreCommentsButton.addEventListener('click', handleMoreCommentsClick.bind(null, moreCommentsButton));
                    discussionThread.children[4].parentNode.insertBefore(moreCommentsButton, discussionThread.children[4]);
                }
            }

            discussionThread.classList.add('block--discussion-thread--checked');
        }
    }

    function addClickHandlerToComments(block) {
        var i,
            comments = block.getElementsByClassName('comment');

        for (i = 0; i < comments.length; i++) {
            comments[i].addEventListener('click', handleCommentClick.bind(null, comments[i]));
        }
    }

    function handleMoreCommentsClick(moreCommentsButton) {
        moreCommentsButton.style.display = 'none';
        moreCommentsButton.parentNode.classList.add('expand');
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
                comment.classList.remove('comment--open');
            } else {
                openComments = document.getElementsByClassName('comment--open');

                for (i = 0; i < openComments.length; i++) {
                    openComments[i].classList.remove('comment--open');
                }

                comment.classList.add('comment--open');
            }
        }
    }

    function targetContainsBlackListedClass(classList) {
        var stopPropagationBlackList = ['more--comments', 'comment__reply', 'comment__recommend', 
                                        'touchpoint__button', 'touchpoint__label'];

        return stopPropagationBlackList.some(function (className) {
            return classList.indexOf(className) >= 0;
        });
    }

    function articleCommentsInserter(html) {
        var blocks,
            commentsContainer,
            emptyCommentBlock,
            i,
            loadingBlock = document.getElementsByClassName('comments__block--loading')[0];

        if (loadingBlock) {
            loadingBlock.style.display = 'none';
        }

        if (!html) {
            emptyCommentBlock = document.getElementsByClassName('comments__block--empty')[0];

            if (emptyCommentBlock) {
                emptyCommentBlock.style.display = 'block';
            }
        } else {
            commentsContainer = document.getElementsByClassName('comments__container')[0];

            if (commentsContainer) {
                blocks = GU.util.getElemsFromHTML(html);

                for (i = 0; i < blocks.length; i++) {
                    commentsContainer.appendChild(blocks[i]);
                    addClickHandlerToComments(blocks[i]);
                }
            }

            commentsReplyFormatting();
        }
    }

    function commentsInserter(html) {
        var blocks,
            commentsContainer = document.getElementsByClassName('comments__container')[0],
            emptyCommentBlock,
            i,
            loadingBlock = document.getElementsByClassName('comments__block--loading')[0];

        if (!html) {
            emptyCommentBlock = document.getElementsByClassName('comments__block--empty')[0];

            if (emptyCommentBlock) {
                emptyCommentBlock.style.display = 'block';
            }

            if (loadingBlock) {
                loadingBlock.style.display = 'none';
            }
        } else {
            if (commentsContainer) {
                blocks = GU.util.getElemsFromHTML(html);

                for (i = 0; i < blocks.length; i++) {
                    commentsContainer.appendChild(blocks[i]);
                    addClickHandlerToComments(blocks[i]);
                }
            }

            commentsReplyFormatting();
        }

        if (commentsContainer && loadingBlock) {
            commentsContainer.appendChild(loadingBlock);
        }
    }

    function articleCommentsFailed() {
        var commentsElem = document.getElementsByClassName('comments')[0],
            failedBlock = document.getElementsByClassName('comments__block--failed')[0],
            loadingBlock = document.getElementsByClassName('comments__block--loading')[0];

        if (failedBlock) {
            failedBlock.style.display = 'block';
        }

        if (loadingBlock) {
            loadingBlock.style.display = 'none';
        }

        if (commentsElem) {
            commentsElem.classList.add('comments-has-failed');
        }
    }

    function commentsEnd() {
        var loadingBlock = document.getElementsByClassName('comments__block--loading')[0];

        if (loadingBlock) {
            loadingBlock.parentNode.removeChild(loadingBlock);
        }
    }

    function commentsClosed() {
        var commentsElem = document.getElementsByClassName('comments')[0],
            discussionElem = document.getElementById('discussion');

        if (commentsElem) {
            commentsElem.classList.add('comments--closed');
        }

        if (discussionElem) {
            discussionElem.classList.add('comments--closed');
        }
    }

    function commentsOpen() {
        var commentsElem = document.getElementsByClassName('comments')[0],
            discussionElem = document.getElementById('discussion');

        if (commentsElem) {
            commentsElem.classList.add('comments--open');
        }

        if (discussionElem) {
            discussionElem.classList.add('comments--open');
        }
    }

    function commentTime() {
        relativeDates.init('.comment__timestamp', 'title');
    }

    function commentsRecommendIncrease(id, number) {
        var target = 'div[id="' + id + '"] .comment__recommend',
            targetElem = document.querySelector(target),
            countElem = document.querySelector(target + ' .comment__recommend__count');

        if (targetElem) {
            targetElem.classList.add('increase');
        }

        if (countElem) {
            countElem.innerText = number;
        }
    }

    function commentsRecommendDecrease(id, number) {
        var target = 'div[id="' + id + '"] .comment__recommend',
            targetElem = document.querySelector(target),
            countElem = document.querySelector(target + ' .comment__recommend__count');

        if (targetElem) {
            targetElem.classList.remove('increase');
        }

        if (countElem) {
            countElem.innerText = number;
        }
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