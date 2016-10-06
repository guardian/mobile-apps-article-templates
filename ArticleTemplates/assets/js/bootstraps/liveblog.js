/*global window,define */
define([
    'modules/relativeDates',
    'modules/twitter',
    'modules/MyScroll',
    'bootstraps/common'
], function (
    relativeDates,
    twitter,
    MyScroll,
    common
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

    function liveblogNewBlockDump() {
        var articleBody = document.getElementsByClassName('article__body')[0],
            images = [],
            blocks,
            counter = 0,
            insertAfterElem = document.getElementsByClassName('article__body--liveblog__pinned')[0],
            newBlockElems,
            i;

        if (newBlockHtml) {
            newBlockElems = GU.util.getElemsFromHTML(newBlockHtml);

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

            // check for tweets
            twitter.checkForTweets();

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

        GU.util.signalDevice('showmore');
    }

    function liveblogDeleteBlock(blockID) {
        var block = document.getElementById(blockID);

        if (block) {
            block.parentNode.removeChild(block);
        }
    }

    function liveblogUpdateBlock(blockID, html) {
        var block = document.getElementById(blockID),
            newBlock = GU.util.getElemsFromHTML(html)[0];

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
            newBlockElems = GU.util.getElemsFromHTML(html);

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

        // check for tweets
        twitter.checkForTweets();
    }

    function liveblogTime() {
        var i,
            blockTimes,
            isLive = false,
            toneLiveBlogElems = document.getElementsByClassName('tone--liveBlog');

        for (i = 0; i < toneLiveBlogElems.length; i++) {
            if (toneLiveBlogElems[i].classList.contains('is-live')) {
                isLive = true;
                break;
            }
        }

        if (isLive) {
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

    function setupTheMinute() {
        var blocks = document.getElementsByClassName('block');

        addClassesToMinuteBlocks(blocks);
        updateMinuteBlockTitles(blocks);

        if (document.body.classList.contains('advert-config--tablet')) {
            adjustMinuteBlocks(blocks);

            // update dimensions on orientation change
            window.addEventListener('resize', GU.util.debounce(adjustMinuteBlocks.bind(null, blocks), 100));
        } else {
            // If windows add background images to minute blocks
            if (document.body.classList.contains('windows')) {   
                addBackgroundImagesToMinuteBlocks(blocks);
            }
            
            initScroller();
        }
    }

    function moveFigcaption(figure, figInner) {
        var figCaption = figure.getElementsByTagName('figcaption')[0];

        if (figCaption && figCaption.parentNode === figure) {
            if (figInner) {
                figInner.insertBefore(figCaption, figInner.firstChild);
            }
        }
    }

    function adjustMinuteBlocks(blocks) {
        var i,
            figure,
            figInner,
            tweet,
            marginTop = 48;

        for (i = 0; i < blocks.length; i++) {
            if (!blocks[i].classList.contains('is-textonly')) {
                figure = blocks[i].getElementsByTagName('figure')[0];

                if (figure) {
                    figInner = figure.getElementsByClassName('figure__inner')[0];
                    
                    if (GU.opts.isOffline) {                        
                        if (figInner) {
                            figInner.style.height = common.getDesiredImageHeight(figure) + 'px';
                        }
                    }

                    if (blocks[i].classList.contains('is-coverimage')) {
                        moveFigcaption(figure, figInner);
                    }
                    
                    blocks[i].classList.remove('flex-block');
                    blocks[i].style.height = 'auto';

                    if (blocks[i].offsetHeight < (figure.offsetHeight + marginTop)) {
                        blocks[i].style.height = figure.offsetHeight + marginTop + 'px';
                        blocks[i].classList.add('flex-block');
                    }
                }
            } else {
                tweet = blocks[i].getElementsByClassName('element-tweet')[0];

                if (tweet) {
                    adjustTweetForMinute(tweet);
                }
            }
        }
    }

    function adjustTweetForMinute(tweet) {
        var i,
            childNode,
            twitterLink = 'https://twitter.com/',
            twitterUser,
            twitterHandle,
            twitterWrapperElem,
            nameElem,
            linkElem,
            blockQuote = tweet.getElementsByClassName('twitter-tweet')[0];

        if (blockQuote) {
            for (i = 0; i < blockQuote.childNodes.length; i++) {
                childNode = blockQuote.childNodes[i];
                if (childNode.nodeType === 3 && 
                    childNode.nodeValue && 
                    childNode.nodeValue.indexOf('@') !== -1) {
                    twitterHandle = childNode.nodeValue.match(/\(([^)]*)\)/g);

                    if (twitterHandle.length) {
                        twitterUser = childNode.nodeValue.replace(twitterHandle[0], '').replace(/\W+/g, ' ');
                        twitterHandle = twitterHandle[0].substring(1, twitterHandle[0].length - 1);
                        twitterLink +=  twitterHandle.replace('@', '');

                        twitterWrapperElem = document.createElement('div');
                        twitterWrapperElem.classList.add('twitter-wrapper');

                        nameElem = document.createElement('span');
                        nameElem.innerText = twitterUser;

                        linkElem = document.createElement('a');
                        linkElem.href = twitterLink;
                        linkElem.innerText = twitterHandle;

                        twitterWrapperElem.appendChild(nameElem);
                        twitterWrapperElem.appendChild(linkElem);

                        blockQuote.insertBefore(twitterWrapperElem, blockQuote.firstChild);

                        blockQuote.removeChild(childNode);
                        i--;
                    }
                } else if (childNode.tagName === 'A') {
                    blockQuote.removeChild(childNode);
                    i--;
                }
            }
        }
    }

    function updateMinuteBlockTitles(blocks) {
        var i, 
            blockTitle,
            titleString;

        for (i = 0; i < blocks.length; i++) {
            blockTitle = blocks[i].getElementsByClassName('block__title')[0];
            
            if (blockTitle) {
                titleString = blockTitle.innerHTML.replace(/^([0-9]+)[.]*[ ]*/g, '<span class="counter">$1</span>');
                blockTitle.innerHTML = titleString;
            }
        }
    }

    function addClassesToMinuteBlocks(blocks) {
        var i,
            block;

        for (i = 0; i < blocks.length; i++) {
            block = blocks[i];

            if (block.getElementsByClassName('element--thumbnail').length) {
                block.classList.add('is-thumbnail');
            } else if (block.getElementsByClassName('element-image').length) {
                block.classList.add('is-coverimage');
            } else if (block.getElementsByClassName('video-URL').length) {
                block.classList.add('is-video');
            } else {
                block.classList.add('is-textonly');
            }

            if (block.getElementsByClassName('quoted').length) {
                block.classList.add('has-quote');
            } else if (block.getElementsByClassName('twitter-tweet').length) {
                block.classList.add('has-tweet');
            }
        }
    }

    function addBackgroundImagesToMinuteBlocks(blocks) {
        var i, j, figureInners, figureImage;

        for (i = 0; i < blocks.length; i++) {
            figureInners = blocks[i].getElementsByClassName('figure__inner');

            for (j = 0; j < figureInners.length; j++) {
                figureImage = figureInners[j].getElementsByTagName('img')[0];
                
                if (figureImage) {
                    figureInners[j].classList.add('the-minute__background-media');
                    figureInners[j].style.backgroundImage = 'url(' + figureImage.getAttribute('src') + ')';
                    figureImage.parentNode.removeChild(figureImage);                            
                }
            }
        }
    }

    function initScroller() {
        var scroller,
            liveblogElem,
            minuteNavElem = document.getElementsByClassName('the-minute__nav')[0],
            wrapperElem = document.getElementsByClassName('article--liveblog')[0],
            options = {
                scrollX: false,
                scrollY: true,
                momentum: false,
                snap: true,
                bounce: false,
                snapSpeed: 600,
                disablePointer: true
            };

        if (wrapperElem) {
            liveblogElem = wrapperElem.getElementsByClassName('article__body--liveblog')[0];

            // liveblogElem must be first child of wrapperElem
            wrapperElem.insertBefore(liveblogElem, wrapperElem.children[0]);

            removeTabletElems();

            setScrollDimensions(liveblogElem, wrapperElem);

            // initialise scroller
            scroller = new MyScroll(wrapperElem, options);

            // onScrollEnd show hide minuteNavElem
            scroller.on('scrollEnd', onScrollEnd.bind(null, minuteNavElem, scroller));

            // add click event handler to minuteNavElem
            minuteNavElem.addEventListener('click', scrollToNextCard.bind(null, minuteNavElem, scroller));
        
            // update scroll dimensions on orientation change
            window.addEventListener('resize', GU.util.debounce(onWindowResize.bind(null, liveblogElem, wrapperElem, scroller), 100));
        }
    }

    function onWindowResize(liveblogElem, wrapperElem, scroller) {
        setScrollDimensions(liveblogElem, wrapperElem);

        setTimeout(function () {
            scroller.refresh();
        }, 0);
    }

    function setScrollDimensions(liveblogElem, wrapperElem) {
        var i,
            elemHeight,
            scrollHeight = 0,
            windowHeight = window.innerHeight;

        // set height of scrollers wrapper    
        wrapperElem.style.height = windowHeight + 'px';

        // set heights of each card within scroller
        for (i = 0; i < liveblogElem.children.length; i++) {
            elemHeight = liveblogElem.children[i].offsetHeight;
            
            if (elemHeight) {
                scrollHeight += windowHeight;
                liveblogElem.children[i].style.height = windowHeight + 'px';
            }
        }

        // set height of scrollable area
        liveblogElem.style.height = scrollHeight + 'px';
    }

    function scrollToNextCard(minuteNavElem, scroller) {
        if ((scroller.currentPage.pageY + 1) !== scroller.pages[0].length) {
            scroller.goToPage(0, scroller.currentPage.pageY + 1, 600);

            onScrollEnd(minuteNavElem, scroller);
        }
    }

    function onScrollEnd(minuteNavElem, scroller) {
        if ((scroller.currentPage.pageY + 1) === scroller.pages[0].length) {
            minuteNavElem.classList.add('hide');
        } else {
            minuteNavElem.classList.remove('hide');
        }
    }

    function removeTabletElems() {
        var i,
            elems = document.querySelectorAll('.minute-logo-container, .minute-vertical-rule');

        for (i = 0; i < elems.length; i++) {
            elems[i].parentNode.removeChild(elems[i]);
        }
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

        newKeyEventLinks = GU.util.getElemsFromHTML(html);

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

    function ready() {
        var minuteHeaderElem,
            minuteNavElem;

        if (!initialised) {
            initialised = true;

            newBlockHtml = '';
            liveblogStartPos = GU.util.getElementOffset(document.getElementsByClassName('article__body--liveblog')[0]);

            setupGlobals();
            keyEvents();
            window.liveblogTime();
            window.addEventListener('scroll', GU.util.debounce(updateBlocksOnScroll, 100, true));
            liveMore();
            
            if (document.body.classList.contains('the-minute')) {
                setupTheMinute();
            } else {
                twitter.init();

                setInterval(window.liveblogTime, 30000);

                if (minuteHeaderElem) {
                    minuteHeaderElem.parentNode.removeChild(minuteHeaderElem);
                }

                if (minuteNavElem) {
                    minuteNavElem.parentNode.removeChild(minuteNavElem);
                }
            }
        }
    }

    return {
        init: ready
    };
});