import { init as initRelativeDates } from 'modules/relativeDates';
import { init as initTwitter, checkForTweets, enhanceTweets } from 'modules/twitter';
import { init as initYoutube, checkForVideos, resetAndCheckForVideos } from 'modules/youtube';
import { formatImages, loadEmbeds, loadInteractives } from 'bootstraps/common';
import { getElemsFromHTML, signalDevice, getElementOffset, debounce, scrollToElement } from 'modules/util';
import { initMpuPoller } from 'modules/ads';
import { initPositionPoller } from 'modules/cards';

let newBlockHtml;
let liveblogStartPos;

function safeEnhanceTweets() {
    if (typeof twttr !== 'undefined' && 'widgets' in twttr && 'load' in twttr.widgets) {
        enhanceTweets();
    }
}

function updateBlocksOnScroll() {
    if (liveblogStartPos.top > window.scrollY) {
        liveblogNewBlockDump();
    }
}

function scrollToBlock(id) {
    const block = document.querySelector(`#${id}`);
    if (block) {
        scrollToElement(block)
        return true;
    }
    return false;
}

function addNewBlockToBlog(insertAfterElem, block) {
    let insertBeforeElem = insertAfterElem.nextSibling;

    block.classList.add('animated');
    block.classList.add('slideinright');

    while (insertBeforeElem && insertBeforeElem.nodeType !== 1) {
        insertBeforeElem = insertBeforeElem.nextSibling;
    }

    if (!insertBeforeElem) {
        insertAfterElem.parentNode.appendChild(block);
    } else {
        insertAfterElem.parentNode.insertBefore(block, insertBeforeElem);
    }
}

function checkInjectedComponents(newBlocksAdded) {
    // When a block has loaded check position of related cards placeholder
    initPositionPoller();
    initMpuPoller(0);
    resetAndCheckForVideos();

    // check for tweets
    checkForTweets();

    if (newBlocksAdded) {
        /**
            If newBlocksAdded wait 700ms to
            check for youtube video atoms as blocks slides in
            from right over 600ms.
        **/
        setTimeout(() => {
            checkForVideos();
        }, 650);
    } else {
        checkForVideos();
    }
}

function liveblogNewBlockDump() {
    const articleBody = document.getElementsByClassName('article__body')[0];
    const images = [];
    let blocks;
    let counter = 0;
    const insertAfterElem = document.getElementsByClassName('article__body--liveblog__pinned')[0];
    let newBlockElems;
    let i;

    if (newBlockHtml) {
        newBlockElems = getElemsFromHTML(newBlockHtml);

        for (i = newBlockElems.length; i > 0; i--) {
            addNewBlockToBlog(insertAfterElem, newBlockElems[i - 1]);
        }

        blocks = articleBody.getElementsByClassName('block');

        while (counter !== newBlockElems.length) {
            images.push(...blocks[counter].getElementsByTagName('img'));
            counter++;
        }

        formatImages(images);
        loadEmbeds();
        loadInteractives();

        // Move mpu ads
        if (window.updateLiveblogAdPlaceholders) {
            window.updateLiveblogAdPlaceholders(true);
        }

        window.liveblogTime();

        checkInjectedComponents(true);

        newBlockHtml = '';
    }
}

function liveMore() {
    const liveMoreElem = document.getElementsByClassName('more--live-blogs')[0];

    if (liveMoreElem) {
        liveMoreElem.addEventListener('click', onLiveMoreClick.bind(null, liveMoreElem));
    }
}

function onLiveMoreClick(liveMoreElem) {
    const loadingElem = document.getElementsByClassName('loading--liveblog')[0];

    liveMoreElem.style.display = 'none';

    if (loadingElem) {
        loadingElem.classList.add('loading--visible');
    }

    signalDevice('showmore');
}

function liveblogDeleteBlock(blockID) {
    const block = document.getElementById(blockID);

    if (block) {
        block.parentNode.removeChild(block);
    }
}

function liveblogUpdateBlock(blockID, html) {
    const block = document.getElementById(blockID);
    const newBlock = getElemsFromHTML(html)[0];

    if (block && newBlock) {
        block.parentNode.replaceChild(newBlock, block);
    }
}

function liveblogLoadMore(html) {
    let i;
    const images = [];
    let blocks;
    const articleBody = document.getElementsByClassName('article__body')[0];
    const oldBlockCount = articleBody.getElementsByClassName('block').length;
    const newBlockElems = getElemsFromHTML(html);

    document.getElementsByClassName('loading--liveblog')[0].classList.remove('loading--visible');

    for (i = 0; i < newBlockElems.length; i++) {
        articleBody.appendChild(newBlockElems[i]);
    }

    blocks = articleBody.getElementsByClassName('block');

    for (i = blocks.length; i > oldBlockCount; i--) {
        images.push(...blocks[i-1].getElementsByTagName('img'));
    }

    formatImages(images);
    loadEmbeds();
    loadInteractives();
    window.liveblogTime();
    checkInjectedComponents(false);
    safeEnhanceTweets();
}

function liveblogTime() {
    let i;
    let blockTimes;
    const toneLiveBlogElems = document.getElementsByClassName('garnett--type-live');

    if (toneLiveBlogElems.length && GU.opts.isLive) {
        initRelativeDates('.key-event__time, .block__time', 'title');
    } else {
        blockTimes = document.getElementsByClassName('block__time');

        for (i = 0; i < blockTimes.length; i++) {
            blockTimes[i].innerHTML = blockTimes[i].getAttribute('title');
        }
    }
}

function showLiveMore(show) {
    const liveMoreElem = document.getElementsByClassName('more--live-blogs')[0];

    if (liveMoreElem) {

        if (show) {
           liveMoreElem.style.display = 'block';
        } else {
            liveMoreElem.style.display = 'none';
        }
    }
}

function liveblogNewBlock(html) {
    newBlockHtml = html + newBlockHtml;
    if (liveblogStartPos.top > window.scrollY) {
        liveblogNewBlockDump();
    }
}

function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function onGapClick(e, afterBlockId, paginationLink) {
    [].slice.call(document.getElementsByClassName(`after-${afterBlockId}`)).forEach(gap => {
        gap.parentNode.removeChild(gap);
    });
    document.getElementById(`loading-${afterBlockId}`).style.display = "block";
}

function liveblogInsertGap(afterBlockId, olderPagination, newerPagination) {
    let before = document.createElement('div');
    let after = document.createElement('div');
    let loading = document.createElement('div');

    before.innerHTML = `
        <div onclick="return onGapClick(event, '${afterBlockId}', '${olderPagination}')" class="more more--live-blogs-blocks after-${afterBlockId}">
            <a href="${olderPagination}" class="more__button">
    	        <span class="more__icon" data-icon="&#xe050;" aria-hidden="true"></span>
    	        <span class="more__text">Load more</span>
            </a>
        </div>
    `;

    after.innerHTML = `
        <div onclick="return onGapClick(event, '${afterBlockId}', '${newerPagination}')" class="more more--live-blogs-blocks after-${afterBlockId}">
            <a href="${newerPagination}" class="more__button">
                <span class="more__icon" data-icon="&#xe050;" aria-hidden="true"></span>
                <span class="more__text">Load more</span>
            </a>
        </div>
    `;

    loading.innerHTML = `<div style="display: none" id="loading-${afterBlockId}" class="loading gap-loading" data-icon="&#xe00C;">`
    insertAfter(document.getElementById(afterBlockId), after);
    insertAfter(document.getElementById(afterBlockId), loading);
    insertAfter(document.getElementById(afterBlockId), before);
}

function liveblogInsertBlocks(afterBlockId, html) {
    let i;
    let images = [];
    let blocks;
    const articleBody = document.getElementsByClassName('article__body')[0];
    const oldBlockCount = articleBody.getElementsByClassName('block').length;
    const newBlockElems = getElemsFromHTML(html);

    const icons = [].slice.call(document.getElementsByClassName('gap-loading'));
    icons.forEach(loadingIcon => loadingIcon.parentNode.removeChild(loadingIcon))

    document.getElementsByClassName('loading--liveblog')[0].classList.remove('loading--visible');

    for (i = 0; i < newBlockElems.length; i++) {
        if (afterBlockId) {
            addNewBlockToBlog(document.getElementById(afterBlockId), newBlockElems[i])
        } else {
            newBlockElems[i].classList.add('animated');
            newBlockElems[i].classList.add('slideinright');
            articleBody.prepend(newBlockElems[i]);
        }
    }

    blocks = articleBody.getElementsByClassName('block');

    const lastLoadedBlock = afterBlockId ? 9 : oldBlockCount;

    for (i = blocks.length; i > lastLoadedBlock; i--) {
        images.push(...blocks[i-1].getElementsByTagName('img'));
    }

    formatImages(images);
    loadEmbeds();
    loadInteractives();

    window.liveblogTime();

    checkInjectedComponents(false);
    safeEnhanceTweets();
}

function setupGlobals() {
    // Global function to handle liveblogs, called by native code
    window.liveblogDeleteBlock = liveblogDeleteBlock;
    window.liveblogUpdateBlock = liveblogUpdateBlock;
    window.liveblogLoadMore = liveblogLoadMore;
    window.liveblogTime = liveblogTime;
    window.showLiveMore = showLiveMore;
    window.liveblogNewBlock = liveblogNewBlock;
    window.liveblogInsertBlocks = liveblogInsertBlocks;
    window.liveblogInsertGap = liveblogInsertGap;
    window.liveblogNewKeyEvent = liveblogNewKeyEvent;
    window.scrollToBlock = scrollToBlock;
    window.onGapClick = onGapClick;

    window.applyNativeFunctionCall('liveblogNewBlock');
    window.applyNativeFunctionCall('liveblogInsertBlocks');
    window.applyNativeFunctionCall('liveblogInsertGap');
    window.applyNativeFunctionCall('liveblogDeleteBlock');
    window.applyNativeFunctionCall('liveblogUpdateBlock');
    window.applyNativeFunctionCall('liveblogNewKeyEvent');
    window.applyNativeFunctionCall('scrollToBlock');
}

function keyEvents() {
    const keyEventsToggle = document.getElementsByClassName('key-events__toggle')[0];
    const keyEventLinks = document.getElementsByClassName('key-event__link');

    if (keyEventsToggle) {
        keyEventsToggle.addEventListener('click', showHideKeyEvents);
    }

    if (keyEventLinks.length === 1) {
        document.querySelector('.key-events__toggle').style.display = 'none';
    }
}

function liveblogNewKeyEvent(html) {
    let i;
    let j;
    const keyEventsList = document.getElementsByClassName('key-events__list')[0];
    let newKeyEventLinks;

    if (!keyEventsList) {
        return;
    }

    newKeyEventLinks = getElemsFromHTML(html);

    for (i = newKeyEventLinks.length; i > 0; i--) {
        newKeyEventLinks[i - 1].classList.add('key-event--highlighted');
        for (j = 0; j < newKeyEventLinks[i - 1].children.length; j++) {
            newKeyEventLinks[i - 1].children[j].classList.add('flipInX');
            newKeyEventLinks[i - 1].children[j].classList.add('animated');
        }
        keyEventsList.insertBefore(newKeyEventLinks[i - 1], keyEventsList.firstChild);
        setTimeout(unhighlightKeyEventLink.bind(null, newKeyEventLinks[i - 1]), 15000);
    }

    captureKeyEventClicks(newKeyEventLinks);
    updateKeyEventCount(keyEventsList.children.length);
    window.liveblogTime();
}

function unhighlightKeyEventLink(link) {
    link.classList.remove('key-event--highlighted');
}

function updateKeyEventCount(count) {
    let i;
    const keyEventsCounter = document.getElementsByClassName('key-events__counter')[0];
    const keyEvents = document.getElementsByClassName('key-events')[0];

    keyEventsCounter.innerHTML = `(${count})`;

    for (i = keyEvents.classList.length; i > 0; i--) {
        if (keyEvents.classList[i - 1].match(/(key-events--)+[0-9]/g)) {
            keyEvents.classList.remove(keyEvents.classList[i - 1]);
        }
    }

    keyEvents.classList.add(`key-events--${count}`);
}

function showHideKeyEvents() {
    const keyEvents = document.getElementsByClassName('key-events')[0];

    if (keyEvents.classList.contains('key-events--expanded')) {
        keyEvents.classList.remove('key-events--expanded');
    } else {
        keyEvents.classList.add('key-events--expanded');
    }
}

function init() {
    newBlockHtml = '';
    liveblogStartPos = getElementOffset(document.getElementsByClassName('article__body--liveblog')[0]);

    setupGlobals();
    keyEvents();
    window.liveblogTime();
    window.addEventListener('scroll', debounce(updateBlocksOnScroll, 100, true));
    liveMore();
    initYoutube();
    setInterval(window.liveblogTime, 30000);

    const articleBody = document.getElementsByClassName('article__body')[0];

    if (articleBody) {
        let images = [];
        [].slice.call(articleBody.getElementsByClassName('block')).forEach(block => {
            images.push(...block.getElementsByTagName('img'));
        })

        setTimeout(() => {
            formatImages(images)
        }, 0);
    }

    initTwitter(() => signalDevice('ready'));
}

export { init };
