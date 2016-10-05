/*global window,define */
define([
    'modules/relativeDates',
    'modules/twitter',
    'bootstraps/common'
], function (
    relativeDates,
    twitter,
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
            relativeDates.init('.block__time', 'title');
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

        window.applyNativeFunctionCall('liveblogNewBlock');
        window.applyNativeFunctionCall('liveblogDeleteBlock');
        window.applyNativeFunctionCall('liveblogUpdateBlock');
    }

    function setupTheMinute() {
        var blocks = document.getElementsByClassName('block');

        addClassesToMinuteBlocks(blocks);
        updateMinuteBlockTitles(blocks);
        adjustMinuteBlocks(blocks);
        // update dimensions on orientation change
        window.addEventListener('resize', GU.util.debounce(adjustMinuteBlocks.bind(null, blocks), 100));
    }

    function moveFigcaption(figure, figInner) {
        var figCaption = figure.getElementsByTagName('figcaption')[0];

        if (figCaption && figCaption.parentNode === figure) {
            if (figInner) {
                figInner.insertBefore(figCaption, figInner.firstChild);
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

    function ready() {
        var minuteHeaderElem,
            minuteNavElem;

        if (!initialised) {
            initialised = true;

            newBlockHtml = '';
            liveblogStartPos = GU.util.getElementOffset(document.getElementsByClassName('article__body--liveblog')[0]);

            setupGlobals();
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