import { init as initRelativeDates } from 'modules/relativeDates';
import {
    init as initTwitter,
    checkForTweets,
} from 'modules/twitter';
import {
    init as initYoutube,
    checkForVideos,
} from 'modules/youtube';
import { init as initMinute } from 'modules/minute';
import {
    formatImages,
    loadEmbeds,
    loadInteractives,
} from 'bootstraps/common';
import {
    getElemsFromHTML,
    signalDevice,
    getElementOffset,
    debounce,
} from 'modules/util';
import { trackLiveBlogEpic } from 'modules/creativeInjector';

let newBlockHtml,
    liveblogStartPos;

function updateBlocksOnScroll() {
    if (liveblogStartPos.top > window.scrollY) {
        liveblogNewBlockDump();
    }
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
    // check for tweets
    checkForTweets();

    if (newBlocksAdded) {
        /**
            If newBlocksAdded wait 700ms to
            check for youtube video atoms as blocks slides in
            from right over 600ms.
        * */
        setTimeout(() => {
            checkForVideos();
        }, 650);
    } else {
        checkForVideos();
    }

    // if there is a contributions epic, track it
    trackLiveBlogEpic();
}

function liveblogNewBlockDump() {
    let articleBody = document.getElementsByClassName('article__body')[0],
        images = [],
        blocks,
        counter = 0,
        insertAfterElem = document.getElementsByClassName('article__body--liveblog__pinned')[0],
        newBlockElems,
        i;

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
    let block = document.getElementById(blockID),
        newBlock = getElemsFromHTML(html)[0];

    if (block && newBlock) {
        block.parentNode.replaceChild(newBlock, block);
    }
}

function liveblogLoadMore(html) {
    let i,
        images = [],
        blocks,
        articleBody = document.getElementsByClassName('article__body')[0],
        oldBlockCount = articleBody.getElementsByClassName('block').length,
        newBlockElems = getElemsFromHTML(html);

    document.getElementsByClassName('loading--liveblog')[0].classList.remove('loading--visible');

    for (i = 0; i < newBlockElems.length; i++) {
        articleBody.appendChild(newBlockElems[i]);
    }

    blocks = articleBody.getElementsByClassName('block');

    for (i = blocks.length; i > oldBlockCount; i--) {
        images.push(...blocks[i - 1].getElementsByTagName('img'));
    }

    formatImages(images);
    loadEmbeds();
    loadInteractives();

    window.liveblogTime();

    checkInjectedComponents(false);
}

function liveblogTime() {
    let i,
        blockTimes,
        toneLiveBlogElems = document.getElementsByClassName('tone--liveBlog');

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

function setupGlobals() {
    // Global function to handle liveblogs, called by native code
    window.liveblogDeleteBlock = liveblogDeleteBlock;
    window.liveblogUpdateBlock = liveblogUpdateBlock;
    window.liveblogLoadMore = liveblogLoadMore;
    window.liveblogTime = liveblogTime;
    window.showLiveMore = showLiveMore;
    window.liveblogNewBlock = liveblogNewBlock;
    window.liveblogNewKeyEvent = liveblogNewKeyEvent;

    window.applyNativeFunctionCall('liveblogNewBlock');
    window.applyNativeFunctionCall('liveblogDeleteBlock');
    window.applyNativeFunctionCall('liveblogUpdateBlock');
    window.applyNativeFunctionCall('liveblogNewKeyEvent');
}

function keyEvents() {
    let keyEventsToggle = document.getElementsByClassName('key-events__toggle')[0],
        keyEventLinks = document.getElementsByClassName('key-event__link');

    if (keyEventsToggle) {
        keyEventsToggle.addEventListener('click', showHideKeyEvents);
    }

    if (keyEventLinks.length) {
        captureKeyEventClicks(keyEventLinks);
    }
}

function liveblogNewKeyEvent(html) {
    let i,
        j,
        keyEventsList = document.getElementsByClassName('key-events__list')[0],
        newKeyEventLinks;

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
    let i,
        keyEventsCounter = document.getElementsByClassName('key-events__counter')[0],
        keyEvents = document.getElementsByClassName('key-events')[0];

    keyEventsCounter.innerHTML = `(${count})`;

    for (i = keyEvents.classList.length; i > 0; i--) {
        if (keyEvents.classList[i - 1].match(/(key-events--)+[0-9]/g)) {
            keyEvents.classList.remove(keyEvents.classList[i - 1]);
        }
    }

    keyEvents.classList.add(`key-events--${count}`);
}

function captureKeyEventClicks(links) {
    let i;

    for (i = 0; i < links.length; i++) {
        links[i].addEventListener('click', handleKeyEventClick);
    }
}

function handleKeyEventClick(evt) {
    evt.preventDefault();
}

function showHideKeyEvents() {
    const keyEvents = document.getElementsByClassName('key-events')[0];

    if (keyEvents.classList.contains('key-events--expanded')) {
        keyEvents.classList.remove('key-events--expanded');
    } else {
        keyEvents.classList.add('key-events--expanded');
    }
}

function removeMinuteElems() {
    let i,
        minuteElems = document.querySelectorAll('.minute-logo-container, .minute-vertical-rule, .the-minute__header');

    for (i = minuteElems.length; i > 0; i--) {
        minuteElems[i - 1].parentNode.removeChild(minuteElems[i - 1]);
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
    trackLiveBlogEpic();

    if (GU.opts.isMinute && GU.opts.adsConfig === 'tablet') {
        initMinute();
    } else {
        removeMinuteElems();
        initTwitter();
        initYoutube();

        setInterval(window.liveblogTime, 30000);
    }
}

export { init };
