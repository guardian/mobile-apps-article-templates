import { init as initRelativeDates } from 'modules/relativeDates';
import { getElemsFromHTML } from 'modules/util';
import SmoothScroll from 'smooth-scroll';

function setupGlobals() {
    window.articleCommentsInserter = articleCommentsInserter;
    window.commentsInserter = commentsInserter; // Almost the same as window.articleCommentsInserter - WHY?
    window.articleCommentsFailed = articleCommentsFailed;
    window.commentsFailed = articleCommentsFailed; // Exactly the same as window.articleCommentsFailed - WHY?
    window.commentsEnd = commentsEnd;
    window.commentsExpand = commentsExpand;
    window.scrollToHighlighted = scrollToHighlighted;
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
    let discussionThread;
    const discussionThreads = document.getElementsByClassName('block--discussion-thread');
    let i;
    let moreCommentsButton;
    let numOfComments;

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
                moreCommentsButton.innerHTML = `<a class="more__label"><span class="more__icon" data-icon="&#xe050;" aria-hidden="true"></span><span class="more__text">${numOfComments} more replies</span></a>`;
                moreCommentsButton.addEventListener('click', handleMoreCommentsClick.bind(null, moreCommentsButton));
                discussionThread.children[4].parentNode.insertBefore(moreCommentsButton, discussionThread.children[4]);
            }
        }

        discussionThread.classList.add('block--discussion-thread--checked');
    }
}

function commentsExpand() {
    const moreButtons = document.getElementsByClassName('more--comments');
    for (let i = 0; i < moreButtons.length; i++) {
        handleMoreCommentsClick(moreButtons[i]);
    }
}

function checkForZero() {
    const comments = document.getElementsByClassName("comments-0")[0];
    if (comments) {
        if ([].slice.call(comments.getElementsByClassName("block--discussion-thread")).length > 0) {
            const emptyCommentBlock = comments.getElementsByClassName("comments__block--empty")[0];
            const commentCount = comments.getElementsByClassName("comments__count")[0];
            if (emptyCommentBlock) {
                emptyCommentBlock.style.display = "none";
            }
            if (commentCount) {
                commentCount.style.display = "none";
            }
        }
    }
}

function addClickHandlerToComments(block) {
    let i;
    const comments = block.getElementsByClassName('comment');

    for (i = 0; i < comments.length; i++) {
        comments[i].addEventListener('click', handleCommentClick.bind(null, comments[i]));
    }
}

function handleMoreCommentsClick(moreCommentsButton) {
    moreCommentsButton.style.display = 'none';
    moreCommentsButton.parentNode.classList.add('expand');
}

function handleCommentClick(comment, evt) {
    let i;
    const classList = [];
    let openComments;

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
    const stopPropagationBlackList = ['more--comments', 'comment__reply', 'comment__recommend',
                                    'touchpoint__button', 'touchpoint__label'];

    return stopPropagationBlackList.some(className => classList.includes(className));
}

function articleCommentsInserter(html) {
    let blocks;
    let commentsContainer;
    let emptyCommentBlock;
    let i;
    const loadingBlock = document.getElementsByClassName('comments__block--loading')[0];

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
            blocks = getElemsFromHTML(html);

            for (i = 0; i < blocks.length; i++) {
                commentsContainer.appendChild(blocks[i]);
                addClickHandlerToComments(blocks[i]);
            }
        }

        commentsReplyFormatting();
        checkForZero();
    }
}

function commentsInserter(html) {
    let blocks;
    const commentsContainer = document.getElementsByClassName('comments__container')[0];
    let emptyCommentBlock;
    let i;
    const loadingBlock = document.getElementsByClassName('comments__block--loading')[0];

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
            blocks = getElemsFromHTML(html);

            for (i = 0; i < blocks.length; i++) {
                commentsContainer.appendChild(blocks[i]);
                addClickHandlerToComments(blocks[i]);
            }
        }

        commentsReplyFormatting();
        checkForZero();
    }

    if (commentsContainer && loadingBlock) {
        commentsContainer.appendChild(loadingBlock);
    }
}

function articleCommentsFailed() {
    const commentsElem = document.getElementsByClassName('comments')[0];
    const failedBlock = document.getElementsByClassName('comments__block--failed')[0];
    const loadingBlock = document.getElementsByClassName('comments__block--loading')[0];

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
    const loadingBlock = document.getElementsByClassName('comments__block--loading')[0];

    if (loadingBlock) {
        loadingBlock.parentNode.removeChild(loadingBlock);
    }
}

function scrollToHighlighted(commentId) {
    const scroll = new SmoothScroll();
    const comment = document.getElementById(commentId);
    setTimeout(() => {
        scroll.animateScroll(comment, {speed: 1500});
    }, 100);
}

function commentsClosed() {
    const commentsElem = document.getElementsByClassName('comments')[0];
    const discussionElem = document.getElementById('discussion');
    const openElem = document.getElementsByClassName('comments__block--empty')[0];

    if (commentsElem) {
        commentsElem.classList.add('comments--closed');
        if (openElem) {
            openElem.style.display = 'none';
        }
    }

    if (discussionElem) {
        discussionElem.classList.add('comments--closed');
    }
}

function commentsOpen() {
    const commentsElem = document.getElementsByClassName('comments')[0];
    const discussionElem = document.getElementById('discussion');

    if (commentsElem) {
        commentsElem.classList.add('comments--open');
    }

    if (discussionElem) {
        discussionElem.classList.add('comments--open');
    }
}

function commentTime() {
    initRelativeDates('.comment__timestamp', 'title');
}

function commentsRecommendIncrease(id, number) {
    const target = `div[id="${id}"] .comment__recommend`;
    const targetElem = document.querySelector(target);
    const countElem = document.querySelector(`${target} .comment__recommend__count`);

    if (targetElem) {
        targetElem.classList.add('increase');
    }

    if (countElem) {
        countElem.innerText = number;
    }
}

function commentsRecommendDecrease(id, number) {
    const target = `div[id="${id}"] .comment__recommend`;
    const targetElem = document.querySelector(target);
    const countElem = document.querySelector(`${target} .comment__recommend__count`);

    if (targetElem) {
        targetElem.classList.remove('increase');
    }

    if (countElem) {
        countElem.innerText = number;
    }
}

function init() {
    setupGlobals();
    commentTime();
}

export { init };