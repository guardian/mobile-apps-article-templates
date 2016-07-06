/*global window,console,define */
define([
    'bean',
    'bonzo',
    'modules/relativeDates',
    'modules/$',
    'modules/twitter',
    'modules/MyScroll',
    'modules/ads'
], function (
    bean,
    bonzo,
    relativeDates,
    $,
    twitter,
    MyScroll,
    Ads
) {
    'use strict';

    var modules = {
            blockUpdates: function () {
                var newBlockHtml = '',
                    liveblogStartPos = $('.article__body--liveblog').offset(),
                    liveblogNewBlockDump = function () {
                        var articleBody = document.getElementsByClassName('article__body')[0],
                            images = [],
                            blocks,
                            counter = 0,
                            blockCount = 0;

                        if (newBlockHtml) {
                            newBlockHtml = bonzo.create(newBlockHtml);
                        
                            $(newBlockHtml).each(function() {
                                blockCount++;
                                $(this).addClass("animated slideinright");
                            });
                            
                            $(".article__body--liveblog__pinned").after(newBlockHtml);

                            blocks = articleBody.getElementsByClassName('block');

                            while (counter !== blockCount) {
                                images.push.apply(images, blocks[counter].getElementsByTagName('img'));
                                counter++;
                            }

                            modules.common.formatImages(images);
                            modules.common.loadEmbeds();
                            modules.common.loadInteractives();

                            // Move mpu ads
                            if (window.updateLiveblogAdPlaceholders) {
                                window.updateLiveblogAdPlaceholders(true);
                            }

                            window.liveblogTime();

                            newBlockHtml = '';
                        }
                    };

                window.liveblogNewBlock = function (html) {
                    newBlockHtml = html + newBlockHtml;
                    if (liveblogStartPos.top > window.scrollY) {
                        liveblogNewBlockDump();
                    }
                };

                window.applyNativeFunctionCall('liveblogNewBlock');

                window.addEventListener('scroll', GU.util.debounce(function () {
                    if (liveblogStartPos.top > window.scrollY) {
                        liveblogNewBlockDump();
                    }
                }, 100, true));
            },

            liveMore: function () {
                if($('.more--live-blogs')[0]){
                    bean.on($('.more--live-blogs')[0], 'click', function () {
                        $(this).hide();
                        $('.loading--liveblog').addClass("loading--visible");
                        window.location.href = 'x-gu://showmore';
                    });
                }
            },

            setupGlobals: function () {
                // Global function to handle liveblogs, called by native code
                window.liveblogDeleteBlock = function (blockID) {
                    $('#' + blockID).remove();
                };

                window.liveblogUpdateBlock = function (blockID, html) {
                    $("#" + blockID).replaceWith(html);
                };

                window.liveblogLoadMore = function (html) {
                    var i,
                        images = [],
                        blocks,
                        articleBody = document.getElementsByClassName('article__body')[0],
                        oldBlockCount = articleBody.getElementsByClassName('block').length;

                    html = bonzo.create(html);

                    $('.loading--liveblog').removeClass("loading--visible");

                    $(html).appendTo('.article__body');

                    blocks = articleBody.getElementsByClassName('block');

                    for (i = blocks.length; i > oldBlockCount; i--) {
                        images.push.apply(images, blocks[i-1].getElementsByTagName('img'));
                    }

                    modules.common.formatImages(images);
                    modules.common.loadEmbeds();
                    modules.common.loadInteractives();

                    window.liveblogTime();

                    // check for tweets
                    twitter.checkForTweets(document.body);
                };

                window.liveblogTime = function () {
                    if ($(".tone--liveBlog").hasClass("is-live")) {
                        relativeDates.init('.block__time', 'title');
                    } else {
                        $('.block__time').each(function (el) {
                            $(el).html(el.getAttribute('title'));
                        });
                    }
                };

                window.showLiveMore = function (show) {
                    if (show) {
                        $('.more--live-blogs').show();
                    } else {
                        $('.more--live-blogs').hide();
                    }
                };

                window.applyNativeFunctionCall('liveblogDeleteBlock');
                window.applyNativeFunctionCall('liveblogUpdateBlock');
            },

            setupTheMinute: function () {
                var blocks = document.getElementsByClassName('block');

                modules.addClassesToMinuteBlocks(blocks);
                modules.updateMinuteBlockTitles(blocks);

                if (document.body.classList.contains('advert-config--tablet')) {
                    modules.adjustMinuteBlocks(blocks);

                    // update dimensions on orientation change
                    bean.on(window, 'resize', GU.util.debounce(modules.adjustMinuteBlocks.bind(null, blocks), 100));
                } else {
                    // If windows add background images to minute blocks
                    if (document.body.classList.contains("windows")) {   
                        modules.addBackgroundImagesToMinuteBlocks(blocks);
                    }
                    modules.initScroller();
                }
            },

            moveFigcaption: function (figure) {
                var figInner,
                    figCaption = figure.getElementsByTagName("figcaption")[0];

                if (figCaption && figCaption.parentNode === figure) {
                    figInner = figure.getElementsByClassName("figure__inner")[0];

                    if (figInner) {
                        figInner.insertBefore(figCaption, figInner.firstChild);
                    }
                }
            },

            adjustMinuteBlocks: function (blocks) {
                var i,
                    figure,
                    isCoverImage,
                    tweet,
                    marginTop = 48;

                for (i = 0; i < blocks.length; i++) {
                    if (!blocks[i].classList.contains('is-textonly')) {
                        figure = blocks[i].getElementsByTagName('figure')[0];

                        if (figure) {
                            if (blocks[i].classList.contains('is-coverimage')) {
                                modules.moveFigcaption(figure);
                            }
                            
                            blocks[i].classList.remove("flex-block");
                            blocks[i].style.height = "auto";

                            if (blocks[i].offsetHeight < (figure.offsetHeight + marginTop)) {
                                blocks[i].style.height = figure.offsetHeight + marginTop + "px";
                                blocks[i].classList.add("flex-block");
                            }
                        }
                    } else {
                        tweet = blocks[i].getElementsByClassName('element-tweet')[0];

                        if (tweet) {
                            modules.adjustTweetForMinute(tweet);
                        }
                    }
                }
            },

            adjustTweetForMinute: function (tweet) {
                var i,
                    childNode,
                    twitterLink = "https://twitter.com/",
                    twitterUser,
                    twitterHandle,
                    twitterWrapperElem,
                    nameElem,
                    linkElem,
                    blockQuote = tweet.getElementsByClassName("twitter-tweet")[0];

                if (blockQuote) {
                    for (i = 0; i < blockQuote.childNodes.length; i++) {
                        childNode = blockQuote.childNodes[i];
                        if (childNode.nodeType === 3 && 
                            childNode.nodeValue && 
                            childNode.nodeValue.indexOf("@") !== -1) {
                            twitterHandle = childNode.nodeValue.match(/\(([^)]*)\)/g);

                            if (twitterHandle.length) {
                                twitterUser = childNode.nodeValue.replace(twitterHandle[0], "").replace(/\W+/g, " ");
                                twitterHandle = twitterHandle[0].substring(1, twitterHandle[0].length - 1);
                                twitterLink +=  twitterHandle.replace("@", "");

                                twitterWrapperElem = document.createElement("div");
                                twitterWrapperElem.classList.add("twitter-wrapper");

                                nameElem = document.createElement("span");
                                nameElem.innerText = twitterUser;

                                linkElem = document.createElement("a");
                                linkElem.href = twitterLink;
                                linkElem.innerText = twitterHandle;

                                twitterWrapperElem.appendChild(nameElem);
                                twitterWrapperElem.appendChild(linkElem);

                                blockQuote.insertBefore(twitterWrapperElem, blockQuote.firstChild);

                                blockQuote.removeChild(childNode);
                                i--;
                            }
                        } else if (childNode.tagName === "A") {
                            blockQuote.removeChild(childNode);
                            i--;
                        }
                    }
                }
            },

            updateMinuteBlockTitles: function (blocks) {
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
            },

            addClassesToMinuteBlocks: function (blocks) {
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
            },

            addBackgroundImagesToMinuteBlocks: function(blocks) {
                var i, j, figureInners, figureImage;

                for (i = 0; i < blocks.length; i++) {
                    figureInners = blocks[i].getElementsByClassName("figure__inner");

                    for (j = 0; j < figureInners.length; j++) {
                        figureImage = figureInners[j].getElementsByTagName("img")[0];
                        
                        if (figureImage) {
                            figureInners[j].classList.add("the-minute__background-media");
                            figureInners[j].style.backgroundImage = "url(" + figureImage.getAttribute("src") + ")";
                            figureImage.parentNode.removeChild(figureImage);                            
                        }
                    }
                }
            },

            initScroller: function () {
                var scroller,
                    minuteNavElem = $(".the-minute__nav"),
                    wrapperElem = document.body.getElementsByClassName("article--liveblog")[0],
                    liveblogElem = wrapperElem.getElementsByClassName("article__body--liveblog")[0],
                    options = {
                        scrollX: false,
                        scrollY: true,
                        momentum: false,
                        snap: true,
                        bounce: false,
                        snapSpeed: 600,
                        disablePointer: true
                    };

                // liveblogElem must be first child of wrapperElem
                wrapperElem.insertBefore(liveblogElem, wrapperElem.children[0]);

                modules.removeTabletElems();

                modules.setScrollDimensions(liveblogElem, wrapperElem);

                // initialise scroller
                scroller = new MyScroll(wrapperElem, options);

                // onScrollEnd show hide minuteNavElem
                scroller.on('scrollEnd', modules.onScrollEnd.bind(null, minuteNavElem, scroller));

                // add click event handler to minuteNavElem
                bean.on(window, 'click', minuteNavElem, modules.scrollToNextCard.bind(null, minuteNavElem, scroller));
            
                // update scroll dimensions on orientation change
                bean.on(window, 'resize', GU.util.debounce(modules.onWindowResize.bind(null, liveblogElem, wrapperElem, scroller), 100));
            },

            onWindowResize: function (liveblogElem, wrapperElem, scroller) {
                modules.setScrollDimensions(liveblogElem, wrapperElem);

                setTimeout(function () {
                    scroller.refresh();
                }, 0);
            },

            setScrollDimensions: function (liveblogElem, wrapperElem) {
                var i,
                    elemHeight,
                    scroller,
                    scrollHeight = 0,
                    windowHeight = window.innerHeight;

                // set height of scrollers wrapper    
                wrapperElem.style.height = windowHeight + "px";

                // set heights of each card within scroller
                for (i = 0; i < liveblogElem.children.length; i++) {
                    elemHeight = liveblogElem.children[i].offsetHeight;
                    
                    if (elemHeight) {
                        scrollHeight += windowHeight;
                        liveblogElem.children[i].style.height = windowHeight + "px";
                    }
                }

                // set height of scrollable area
                liveblogElem.style.height = scrollHeight + "px";
            },           

            scrollToNextCard: function (minuteNavElem, scroller, evt) {
                if ((scroller.currentPage.pageY + 1) !== scroller.pages[0].length) {
                    scroller.goToPage(0, scroller.currentPage.pageY + 1, 600);

                    modules.onScrollEnd(minuteNavElem, scroller);
                }
            },

            onScrollEnd: function (minuteNavElem, scroller) {
                if ((scroller.currentPage.pageY + 1) === scroller.pages[0].length) {
                    minuteNavElem.addClass("hide");
                } else {
                    minuteNavElem.removeClass("hide");
                }
            },

            removeTabletElems: function () {
                var i,
                    elems = document.querySelectorAll('.minute-logo-container, .minute-vertical-rule');

                for (i = 0; i < elems.length; i++) {
                    elems[i].parentNode.removeChild(elems[i]);
                }
            }
        },
        ready = function (common) {
            if (!this.initialised) {
                modules.common = common;

                this.initialised = true;
                modules.setupGlobals();
                window.liveblogTime();
                modules.blockUpdates();
                modules.liveMore();
                twitter.init();
                if ($('body').hasClass('the-minute')) {
                    // do any "the minute" js here
                    modules.setupTheMinute();
                } else {
                    setInterval(window.liveblogTime, 30000);
                    $('.the-minute__header, .the-minute__nav').remove();
                    twitter.enhanceTweets();
                }
                // console.info("Liveblog ready");
            }
        };

    return {
        init: ready
    };
});