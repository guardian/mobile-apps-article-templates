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
                    updateCounter = 0,
                    liveblogStartPos = $('.article__body--liveblog').offset(),

                    liveblogNewBlockDump = function () {
                        newBlockHtml = bonzo.create(newBlockHtml);
                        $(newBlockHtml).each(function() {
                            $(this).addClass("animated slideinright");
                        });
                        $(".article__body--liveblog__pinned").after(newBlockHtml);

                        // Move mpu ads
                        window.updateLiveblogAdPlaceholders(true);

                        // See Common bootstrap
                        window.articleImageSizer();
                        window.liveblogTime();
                        window.loadEmbeds();
                        window.loadInteractives();
                        newBlockHtml = '';
                    };

                window.liveblogNewBlock = function (html) {
                    newBlockHtml = html + newBlockHtml;
                    if (liveblogStartPos.top > window.scrollY) {
                        liveblogNewBlockDump();
                    }
                };

                window.applyNativeFunctionCall('liveblogNewBlock');

                bean.on(window, 'scroll', function () {
                    if (liveblogStartPos.top > window.scrollY) {
                        liveblogNewBlockDump();
                    }
                });
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
                    html = bonzo.create(html);

                    $('.loading--liveblog').removeClass("loading--visible");
                    $(html).appendTo('.article__body');

                    // See Common bootstrap
                    window.articleImageSizer();
                    window.liveblogTime();
                    window.loadEmbeds();
                    window.loadInteractives();

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
                    modules.adjustMinuteBlocksWithCoverImages(blocks);

                    // update dimensions on orientation change
                    bean.on(window, 'resize', window.ThrottleDebounce.debounce(100, false, modules.adjustMinuteBlocksWithCoverImages.bind(null, blocks)));
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
                    figCaption = figure.querySelector("figcaption");

                if (figCaption && figCaption.parentNode === figure) {
                    figInner = figure.querySelector(".figure__inner");
                    if (figInner) {
                        figInner.insertBefore(figCaption, figInner.firstChild);
                    }
                }
            },

            adjustMinuteBlocksWithCoverImages: function (blocks) {
                var i,
                    figure,
                    marginTopPixels = 60;

                for (i = 0; i < blocks.length; i++) {
                    if (blocks[i].classList.contains('is-coverimage') || blocks[i].classList.contains('is-thumbnail')) {
                        figure = blocks[i].querySelector('figure.element-image');

                        if (figure) {
                            // if (blocks[i].classList.contains('is-coverimage')) {
                                modules.moveFigcaption(figure);
                            // }
                            blocks[i].style.height = figure.offsetHeight + marginTopPixels + "px";
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
                    blockTitle = blocks[i].querySelector('.block__title');
                    
                    if (blockTitle) {
                        titleString = blockTitle.innerHTML.replace(/^([0-9]+)[.]*[ ]*/g, '<span class="counter">$1</span>');
                        blockTitle.innerHTML = titleString;
                    }
                }
            },

            addClassesToMinuteBlocks: function (blocks) {
                var i,
                    inlineImage,
                    block,
                    thumbnail;

                for (i = 0; i < blocks.length; i++) {
                    block = blocks[i];

                    if (block.classList.contains('block--live-key-event') || 
                        block.classList.contains('block--live-summary')) {
                        thumbnail = block.getElementsByClassName('element--thumbnail');
                        inlineImage = block.getElementsByClassName('element-image ');

                        if (thumbnail.length) {
                            block.classList.add('is-thumbnail');
                        } else if (inlineImage.length) {
                            block.classList.add('is-coverimage');
                        } else {
                            block.classList.add('is-textonly');
                        }
                    }
                }
            },

            addBackgroundImagesToMinuteBlocks: function(blocks) {
                var i, j, figureInners, figureImage;

                for (i = 0; i < blocks.length; i++) {
                    figureInners = blocks[i].getElementsByClassName("figure__inner");

                    for (j = 0; j < figureInners.length; j++) {
                        figureImage = figureInners[j].querySelector("img");
                        
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
                    wrapperElem = document.body.querySelector(".article--liveblog"),
                    liveblogElem = wrapperElem.querySelector(".article__body--liveblog"),
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

                modules.setScrollDimensions(liveblogElem, wrapperElem);

                // initialise scroller
                scroller = new MyScroll(wrapperElem, options);

                // onScrollEnd show hide minuteNavElem
                scroller.on('scrollEnd', modules.onScrollEnd.bind(null, minuteNavElem, scroller));

                // add click event handler to minuteNavElem
                bean.on(window, 'click', minuteNavElem, modules.scrollToNextCard.bind(null, minuteNavElem, scroller));
            
                // update scroll dimensions on orientation change
                bean.on(window, 'resize', window.ThrottleDebounce.debounce(100, false, modules.onWindowResize.bind(null, liveblogElem, wrapperElem, scroller)));

                // enhance tweets in scroller for large devices only
                if (document.body.classList.contains('advert-config--tablet')) {
                    twitter.checkForTweets(liveblogElem);
                }
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
            }
        },

        ready = function () {
            if (!this.initialised) {
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