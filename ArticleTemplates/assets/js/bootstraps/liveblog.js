/*global window,console,define */
define([
    'bean',
    'bonzo',
    'modules/$',
    'modules/relativeDates',
    'modules/twitter',
    'modules/MyScroll'
], function (
    bean,
    bonzo,
    $,
    relativeDates,
    twitter,
    MyScroll
) {
    'use strict';

    var common,
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
            insertBeforeElem = insertBeforeElem.nextSibling
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

            newBlockHtml = '';
        }
    }

    function liveMore() {
        if($('.more--live-blogs')[0]){
            bean.on($('.more--live-blogs')[0], 'click', function () {
                $(this).hide();
                $('.loading--liveblog').addClass('loading--visible');
                
                GU.util.signalDevice('showmore');
            });
        }
    }

    function liveblogDeleteBlock(blockID) {
        $('#' + blockID).remove();
    }

    function liveblogUpdateBlock(blockID, html) {
        $('#' + blockID).replaceWith(html);
    }

    function liveblogLoadMore(html) {
        var i,
            images = [],
            blocks,
            articleBody = document.getElementsByClassName('article__body')[0],
            oldBlockCount = articleBody.getElementsByClassName('block').length;

        html = bonzo.create(html);

        $('.loading--liveblog').removeClass('loading--visible');

        $(html).appendTo('.article__body');

        blocks = articleBody.getElementsByClassName('block');

        for (i = blocks.length; i > oldBlockCount; i--) {
            images.push.apply(images, blocks[i-1].getElementsByTagName('img'));
        }

        common.formatImages(images);
        common.loadEmbeds();
        common.loadInteractives();

        window.liveblogTime();

        // check for tweets
        twitter.checkForTweets(document.body);
    }

    function liveblogTime() {
        if ($('.tone--liveBlog').hasClass('is-live')) {
            relativeDates.init('.block__time', 'title');
        } else {
            $('.block__time').each(function (el) {
                $(el).html(el.getAttribute('title'));
            });
        }
    }

    function showLiveMore(show) {
        if (show) {
            $('.more--live-blogs').show();
        } else {
            $('.more--live-blogs').hide();
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

        if (document.body.classList.contains('advert-config--tablet')) {
            adjustMinuteBlocks(blocks);

            // update dimensions on orientation change
            bean.on(window, 'resize', GU.util.debounce(adjustMinuteBlocks.bind(null, blocks), 100));
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
            isCoverImage,
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
            blockTitles = [],
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
            minuteNavElem = $('.the-minute__nav'),
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
            bean.on(window, 'click', minuteNavElem, scrollToNextCard.bind(null, minuteNavElem, scroller));
        
            // update scroll dimensions on orientation change
            bean.on(window, 'resize', GU.util.debounce(onWindowResize.bind(null, liveblogElem, wrapperElem, scroller), 100));
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
            scroller,
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

    function scrollToNextCard(minuteNavElem, scroller, evt) {
        if ((scroller.currentPage.pageY + 1) !== scroller.pages[0].length) {
            scroller.goToPage(0, scroller.currentPage.pageY + 1, 600);

            onScrollEnd(minuteNavElem, scroller);
        }
    }

    function onScrollEnd(minuteNavElem, scroller) {
        if ((scroller.currentPage.pageY + 1) === scroller.pages[0].length) {
            minuteNavElem.addClass('hide');
        } else {
            minuteNavElem.removeClass('hide');
        }
    }

    function removeTabletElems() {
        var i,
            elems = document.querySelectorAll('.minute-logo-container, .minute-vertical-rule');

        for (i = 0; i < elems.length; i++) {
            elems[i].parentNode.removeChild(elems[i]);
        }
    }

    function ready(commonObj) {
        if (!this.initialised) {
            this.initialised = true;

            common = commonObj;
            newBlockHtml = '';
            liveblogStartPos = $('.article__body--liveblog').offset();
    
            setupGlobals();
            window.liveblogTime();
            window.addEventListener('scroll', GU.util.debounce(updateBlocksOnScroll, 100, true));
            liveMore();
            
            twitter.init();
            
            if ($('body').hasClass('the-minute')) {
                setupTheMinute();
            } else {
                setInterval(window.liveblogTime, 30000);
                $('.the-minute__header, .the-minute__nav').remove();
                twitter.enhanceTweets();
            }
        }
    }

    return {
        init: ready
    };
});