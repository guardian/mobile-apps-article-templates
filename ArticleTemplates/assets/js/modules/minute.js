define([
    'bootstraps/common',
    'modules/util'
], function (
    common,
    util
) {
    'use strict';

    var initialised;

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

    function moveFigcaption(figure, figInner) {
        var figCaption = figure.getElementsByTagName('figcaption')[0];

        if (figCaption && figCaption.parentNode === figure) {
            if (figInner) {
                figInner.insertBefore(figCaption, figInner.firstChild);
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

    function ready() {
        var blocks = document.getElementsByClassName('block');

        if (!initialised) {
            initialised = true;
            addClassesToMinuteBlocks(blocks);
            updateMinuteBlockTitles(blocks);
            adjustMinuteBlocks(blocks);
            window.addEventListener('resize', util.debounce(adjustMinuteBlocks.bind(null, blocks), 100));
        }
    }

    return {
        init: ready
    };
});