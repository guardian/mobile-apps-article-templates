define([
    'modules/relativeDates',
    'modules/twitter',
    'modules/youtube',
    'modules/minute',
    'bootstraps/common',
    'modules/util',
    'modules/creativeInjector'
], function (
    relativeDates,
    twitter,
    youtube,
    minute,
    common,
    util,
    creativeInjector
) {
    'use strict';

    var initialised,
        newBlockHtml,
        liveblogStartPos;

    function updateBlocksOnScroll() {
        if (liveblogStartPos.top > window.scrollY) {
            liveblogNewBlockDump();
        }
    }

    function addNewBlockToBlog(insertAfterElem, block) {
        var insertBeforeElem = insertAfterElem.nextSibling;

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

    function checkInjectedComponents() {
      // check for tweets
      twitter.checkForTweets();

      // check for youtube video atoms
      youtube.checkForVideos();

      // if there is a contributions epic, track it
      creativeInjector.trackLiveBlogEpic();
    }

    function liveblogNewBlockDump() {
        var articleBody = document.getElementsByClassName('article__body')[0],
            images = [],
            blocks,
            counter = 0,
            insertAfterElem = document.getElementsByClassName('article__body--liveblog__pinned')[0],
            newBlockElems,
            i;

        if (newBlockHtml) {
            newBlockElems = util.getElemsFromHTML(newBlockHtml);

            for (i = newBlockElems.length; i > 0; i--) {
                addNewBlockToBlog(insertAfterElem, newBlockElems[i - 1]);
            }            

            blocks = articleBody.getElementsByClassName('block');

            while (counter !== newBlockElems.length) {
                images.push.apply(images, blocks[counter].getElementsByTagName('img'));
                counter++;
            }

            common.formatImages(images);
            common.loadEmbeds();
            common.loadInteractives();

            // Move mpu ads
            if (window.updateLiveblogAdPlaceholders) {
                window.updateLiveblogAdPlaceholders(true);
            }

            window.liveblogTime();

            checkInjectedComponents();

            newBlockHtml = '';
        }
    }

    function liveMore() {
        var liveMoreElem = document.getElementsByClassName('more--live-blogs')[0];

        if (liveMoreElem) {
            liveMoreElem.addEventListener('click', onLiveMoreClick.bind(null, liveMoreElem));
        }
    }

    function onLiveMoreClick(liveMoreElem) {
        var loadingElem = document.getElementsByClassName('loading--liveblog')[0];

        liveMoreElem.style.display = 'none';

        if (loadingElem) {
            loadingElem.classList.add('loading--visible');
        }

        util.signalDevice('showmore');
    }

    function liveblogDeleteBlock(blockID) {
        var block = document.getElementById(blockID);

        if (block) {
            block.parentNode.removeChild(block);
        }
    }

    function liveblogUpdateBlock(blockID, html) {
        var block = document.getElementById(blockID),
            newBlock = util.getElemsFromHTML(html)[0];

        if (block && newBlock) {
            block.parentNode.replaceChild(newBlock, block);
        }
    }

    function liveblogLoadMore(html) {
        var i,
            images = [],
            blocks,
            articleBody = document.getElementsByClassName('article__body')[0],
            oldBlockCount = articleBody.getElementsByClassName('block').length,
            newBlockElems = util.getElemsFromHTML(html);

        document.getElementsByClassName('loading--liveblog')[0].classList.remove('loading--visible');

        for (i = 0; i < newBlockElems.length; i++) {
            articleBody.appendChild(newBlockElems[i]);
        }

        blocks = articleBody.getElementsByClassName('block');

        for (i = blocks.length; i > oldBlockCount; i--) {
            images.push.apply(images, blocks[i-1].getElementsByTagName('img'));
        }

        common.formatImages(images);
        common.loadEmbeds();
        common.loadInteractives();

        window.liveblogTime();

        checkInjectedComponents();
    }

    function liveblogTime() {
        var i,
            blockTimes,
            toneLiveBlogElems = document.getElementsByClassName('tone--liveBlog');

        if (toneLiveBlogElems.length && GU.opts.isLive) {
            relativeDates.init('.key-event__time, .block__time', 'title');
        } else {
            blockTimes = document.getElementsByClassName('block__time');

            for (i = 0; i < blockTimes.length; i++) {
                blockTimes[i].innerHTML = blockTimes[i].getAttribute('title');
            }
        }
    }

    function showLiveMore(show) {
        var liveMoreElem = document.getElementsByClassName('more--live-blogs')[0];

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
        var keyEventsToggle = document.getElementsByClassName('key-events__toggle')[0],
            keyEventLinks = document.getElementsByClassName('key-event__link');

        if (keyEventsToggle) {
            keyEventsToggle.addEventListener('click', showHideKeyEvents);
        }

        if (keyEventLinks.length) {
            captureKeyEventClicks(keyEventLinks);
        }
    }

    function liveblogNewKeyEvent(html) {
        var i,
            j,
            keyEventsList = document.getElementsByClassName('key-events__list')[0],
            newKeyEventLinks;

        if (!keyEventsList) {
            return;
        }

        newKeyEventLinks = util.getElemsFromHTML(html);

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
        var i,
            keyEventsCounter = document.getElementsByClassName('key-events__counter')[0],
            keyEvents = document.getElementsByClassName('key-events')[0];

        keyEventsCounter.innerHTML = '(' + count + ')';

        for (i = keyEvents.classList.length; i > 0; i--) {
            if (keyEvents.classList[i - 1].match(/(key-events--)+[0-9]/g)) {
                keyEvents.classList.remove(keyEvents.classList[i - 1]);
            }    
        }

        keyEvents.classList.add('key-events--' + count);
    }

    function captureKeyEventClicks(links) {
        var i;

        for (i = 0; i < links.length; i++) {
            links[i].addEventListener('click', handleKeyEventClick);
        }
    }

    function handleKeyEventClick(evt) {
        evt.preventDefault();
    }

    function showHideKeyEvents() {
        var keyEvents = document.getElementsByClassName('key-events')[0];

        if (keyEvents.classList.contains('key-events--expanded')) {
            keyEvents.classList.remove('key-events--expanded');
        } else {
            keyEvents.classList.add('key-events--expanded');
        }
    }

    function removeMinuteElems() {
        var i,
            minuteElems = document.querySelectorAll('.minute-logo-container, .minute-vertical-rule, .the-minute__header');

        for (i = minuteElems.length; i > 0; i--) {
            minuteElems[i-1].parentNode.removeChild(minuteElems[i-1]);
        }
    }

    function ready() {
        if (!initialised) {
            initialised = true;

            newBlockHtml = '';
            liveblogStartPos = util.getElementOffset(document.getElementsByClassName('article__body--liveblog')[0]);

            setupGlobals();
            keyEvents();
            window.liveblogTime();
            window.addEventListener('scroll', util.debounce(updateBlocksOnScroll, 100, true));
            liveMore();
            creativeInjector.trackLiveBlogEpic();

            if (GU.opts.isMinute && GU.opts.adsConfig === 'tablet') {
                minute.init();
            } else {
                removeMinuteElems();
                twitter.init();
                youtube.init();

                setInterval(window.liveblogTime, 30000);
            }
        }
    }

    return {
        init: ready
    };
});
