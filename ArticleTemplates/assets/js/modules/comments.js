import { init as initRelativeDates } from 'modules/relativeDates';
import { getElemsFromHTML, scrollToElement } from 'modules/util';

function targetContainsBlackListedClass(classList) {
    const stopPropagationBlackList = ['more--comments', 'comment__reply', 'comment__recommend',
        'touchpoint__button', 'touchpoint__label'];

    return stopPropagationBlackList.some(className => classList.includes(className));
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

function addClickHandlerToComments(block) {
    let i;
    const comments = block.getElementsByClassName('comment');

    for (i = 0; i < comments.length; i++) {
        comments[i].addEventListener('click', handleCommentClick.bind(null, comments[i]));
    }
}

function handleMoreCommentsClick(moreButton) {
    moreButton.style.display = 'none';
    moreButton.parentNode.classList.add('expand');
}

function commentsReplyFormatting() {
    const threads = document.getElementsByClassName('block--discussion-thread');
    let thread;
    let moreButton;
    let numOfComments;
    let i;

    for (i = 0; i < threads.length; i++) {
        thread = threads[i];

        if (!thread.classList.contains('block--discussion-thread--checked') &&
            thread.children &&
            thread.children.length >= 5) {
            numOfComments = thread.children.length - 4;

            if (numOfComments === 1) {
                thread.classList.add('block--discussion-thread--orphan');
            } else {
                moreButton = document.createElement('div');
                moreButton.classList.add('more');
                moreButton.classList.add('more--comments');
                moreButton.innerHTML = `<a class="more__label"><span class="more__icon" data-icon="&#xe050;" aria-hidden="true"></span><span class="more__text">${numOfComments} more replies</span></a>`;
                moreButton.addEventListener('click', handleMoreCommentsClick.bind(null, moreButton));
                thread.children[4].parentNode.insertBefore(moreButton, thread.children[4]);
            }
        }

        thread.classList.add('block--discussion-thread--checked');
    }
}

function checkForCorrectCount() {
    const firstPage = !!document.getElementsByClassName('comments__title').length;
    const actualCommentBlocks = document.getElementsByClassName('block--discussion-thread').length;
    const actualCommentCount = actualCommentBlocks + document.getElementsByClassName('is-response').length;
    const correctCount = !!document.getElementsByClassName('comments-' + actualCommentCount).length;
    const commentCount = document.getElementsByClassName('comments__count')[0];

    if (firstPage && !correctCount && actualCommentBlocks < 3) {
        if (commentCount) {
            commentCount.style.display = 'none';
        }
    }

    if (actualCommentCount) {
        const emptyCommentBlock = document.getElementsByClassName('comments__block--empty')[0];
        if (emptyCommentBlock) {
            emptyCommentBlock.style.display = 'none';
        }

        if (commentCount) {
            const shownCount = parseInt(commentCount.innerHTML);
            if (shownCount < actualCommentCount) {
                commentCount.innerHTML = actualCommentCount;
            }
        }
    }
}

function commentsEnd() {
    const loadingBlock = document.getElementsByClassName('comments__block--loading')[0];

    if (loadingBlock) {
        loadingBlock.parentNode.removeChild(loadingBlock);
    }
}

function articleCommentsInserter(html) {
    let blocks = [];
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
        checkForCorrectCount();

        let commentCount = document.getElementsByClassName('comments__count')[0];
        if (commentCount && blocks.length === parseInt(commentCount.innerHTML)) {
            commentsEnd();
        }
    }
}

function commentsExpand() {
    const moreButtons = document.getElementsByClassName('more--comments');
    for (let i = 0; i < moreButtons.length; i++) {
        handleMoreCommentsClick(moreButtons[i]);
    }
}

function commentsInserter(html) {
    let blocks = [];
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
        checkForCorrectCount();
    }

    if (commentsContainer && loadingBlock) {
        commentsContainer.appendChild(loadingBlock);
    }

    let commentCount = document.getElementsByClassName('comments__count')[0];
    if (commentCount && blocks.length === parseInt(commentCount.innerHTML)) {
        commentsEnd();
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

function scrollToHighlighted(commentId) {
    setTimeout(() => {
        scrollToElement(document.getElementById(commentId));
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

function setupGlobals() {
    window.articleCommentsInserter = articleCommentsInserter;
    // Almost the same as window.articleCommentsInserter - WHY?
    window.commentsInserter = commentsInserter;
    window.articleCommentsFailed = articleCommentsFailed;
    // Exactly the same as window.articleCommentsFailed - WHY?
    window.commentsFailed = articleCommentsFailed;
    window.commentsEnd = commentsEnd;
    window.commentsExpand = commentsExpand;
    window.scrollToHighlighted = scrollToHighlighted;
    window.commentsClosed = commentsClosed;
    window.commentsOpen = commentsOpen;
    window.commentTime = commentTime;
    window.commentsRecommendIncrease = commentsRecommendIncrease;
    window.commentsRecommendDecrease = commentsRecommendDecrease;
    window.checkForCorrectCount = checkForCorrectCount;

    window.applyNativeFunctionCall('articleCommentsInserter');
    window.applyNativeFunctionCall('commentsInserter');
    window.applyNativeFunctionCall('commentsFailed');
    window.applyNativeFunctionCall('commentsClosed');
    window.applyNativeFunctionCall('commentsOpen');
    window.applyNativeFunctionCall('articleCommentsFailed');
}

function init() {
    setupGlobals();
    commentTime();
}

export { init };
