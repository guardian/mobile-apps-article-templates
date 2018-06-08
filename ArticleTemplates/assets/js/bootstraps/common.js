import { attach } from 'fastclick';
import { render } from 'fence';
import { init as initSmoothScroll } from 'smooth-scroll';

import {
    getClosestParentWithTag,
    debounce,
    getElementOffset,
    signalDevice,
    isElementPartiallyInViewport,
} from 'modules/util';
import { init as initComments } from 'modules/comments';
import { init as initCards } from 'modules/cards';
import { init as initMoreTags } from 'modules/more-tags';
import { init as initSharing } from 'modules/sharing';
import { init as initAB } from 'modules/experiments/ab';

let trackCommentContainerView = true;

function init() {
    attach(document.body); // polyfill to remove click delays on browsers with touch
    setupGlobals();
    formatImages();
    figcaptionToggle();
    articleContentType();
    insertTags();
    initComments(); // load comments
    initCards(); // load cards
    loadEmbeds();
    loadInteractives();
    showTabs();
    setGlobalObject();
    fixSeries();
    advertorialUpdates();
    initSharing(); // init sharing
    setupTracking(); // track common events
    initAB(); // init ab tests
    initSmoothScroll();

    if (!document.body.classList.contains('no-ready')) {
        signalDevice('ready');
    }
}

function formatImages(images) {
    let figure,
        figures = [],
        i,
        image;

    if (!images) {
        images = document.querySelectorAll('.article img');
    }

    for (i = 0; i < images.length; i++) {
        image = images[i];
        figure = getClosestParentWithTag(image, 'figure');

        if (figure) {
            figures.push(figure);
        }
    }

    formatFigures(figures);

    if (GU.opts.isOffline) {
        checkAvailabilityOfImages(images);
    }
}

function formatFigures(figures) {
    let i,
        figure;

    for (i = 0; i < figures.length; i++) {
        figure = figures[i];

        if (figure.classList.contains('element-image')) {
            formatElementImageFigure(figure);
        }
    }
}

function formatElementImageFigure(figure) {
    let caption = figure.getElementsByClassName('element-image__caption')[0],
        captionIcon = figure.getElementsByClassName('figure__caption__icon')[0],
        desiredImageHeight,
        isThumbnail = figure.classList.contains('element--thumbnail'),
        imageClass = isThumbnail && caption ? 'figure--thumbnail-with-caption' : (isThumbnail ? 'figure--thumbnail' : 'figure-wide'),
        imageOrLinkedImage = figure.children[0],
        imageWrapper;

    figure.classList.add(imageClass);

    if (isThumbnail) {
        formatElementThumbnailFigure(figure);
    }

    if (imageOrLinkedImage &&
        !imageOrLinkedImage.classList.contains('figure__inner')) {
        imageWrapper = document.createElement('div');
        imageWrapper.classList.add('figure__inner');
        imageWrapper.appendChild(imageOrLinkedImage);

        figure.insertBefore(imageWrapper, figure.firstChild);

        // only set imageWrapper height to desired height of thumbnails/wide images on non-minute layouts
        if (!GU.opts.isMinute && (isThumbnail || imageClass === 'figure-wide')) {
            desiredImageHeight = getDesiredImageHeight(figure);
            if (desiredImageHeight) {
                imageWrapper.style.height = `${desiredImageHeight}px`;
            }
            window.addEventListener('resize', debounce(resizeImageWrapper.bind(null, imageWrapper, figure), 100));
        }
    }

    if (caption && !captionIcon) {
        caption.innerHTML = `<span data-icon="&#xe044;" class="figure__caption__icon" aria-hidden="true"></span>${caption.innerHTML}`;
    }
}

function formatElementThumbnailFigure(figure) {
    let thumbnailImage = figure.getElementsByTagName('img')[0],
        isPortrait = parseInt(thumbnailImage.getAttribute('height'), 10) > parseInt(thumbnailImage.getAttribute('width'), 10);

    if (isPortrait) {
        figure.classList.add('portrait-thumbnail');
    } else {
        figure.classList.add('landscape-thumbnail');
    }
}

function checkAvailabilityOfImages(images) {
    let i,
        dummyImage,
        image;

    for (i = 0; i < images.length; i++) {
        // if image doesn't load replace with placeholder or hide
        image = images[i];
        dummyImage = new Image();
        dummyImage.onerror = hideImageOnError.bind(null, image);
        dummyImage.src = image.getAttribute('src');
    }
}

function hideImageOnError(image) {
    let innerElem;

    if (image.parentNode.classList.contains('element-image-inner')) {
        image.style.display = 'none';
    } else {
        innerElem = document.createElement('div');
        innerElem.classList.add('element-image-inner');
        innerElem.setAttribute('height', image.getAttribute('height'));
        innerElem.setAttribute('width', image.getAttribute('width'));
        image.parentNode.replaceChild(innerElem, image);
    }
}

function getDesiredImageHeight(figure) {
    let elem = figure.getElementsByTagName('img')[0] || figure.getElementsByClassName('element-image-inner')[0],
        imgWidth = elem.getAttribute('width'),
        imgHeight = elem.getAttribute('height'),
        figInner = figure.getElementsByClassName('figure__inner')[0],
        figInnerWidth = getElementOffset(figInner).width,
        scale = figInnerWidth / imgWidth,
        newHeight = imgHeight * scale;

    return Math.round(newHeight);
}

function resizeImageWrapper(imageWrapper, figure) {
    imageWrapper.style.height = `${getDesiredImageHeight(figure)}px`;
}

function figcaptionToggle() {
    let toggleCaptionVisibilityBound,
        mainMediaCaption = document.getElementsByClassName('main-media__caption__icon')[0],
        mainMediaCaptionText = document.getElementsByClassName('main-media__caption__text')[0];

    if (mainMediaCaption && mainMediaCaptionText) {
        toggleCaptionVisibilityBound = toggleCaptionVisibility.bind(null, mainMediaCaptionText);
        mainMediaCaption.addEventListener('click', toggleCaptionVisibilityBound);
    }
}

function toggleCaptionVisibility(mainMediaCaptionText) {
    const className = 'is-visible';

    if (mainMediaCaptionText.classList.contains(className)) {
        mainMediaCaptionText.classList.remove(className);
    } else {
        mainMediaCaptionText.classList.add(className);
    }
}

function articleContentType() {
    let i,
        proseElem,
        proseElems = document.querySelectorAll('.article__body > .prose');

    for (i = 0; i < proseElems.length; i++) {
        proseElem = proseElems[i];

        if (proseElem.querySelectorAll('.figure--thumbnail:not(.figure--thumbnail-with-caption)').length) {
            proseElem.classList.add('prose--is-panel');
        }
    }
}

function insertTags() {
    window.articleTagInserter = articleTagInserter;
    window.applyNativeFunctionCall('articleTagInserter');
}

function articleTagInserter(html) {
    const tagsList = document.querySelector('.tags .inline-list');

    if (tagsList) {
        tagsList.innerHTML += html;
        initMoreTags();
    }
}

function reportVideoPositions() {
    let i,
        mainMediaElem,
        mainMediaElemOffset,
        mainMediaElems = document.getElementsByClassName('video-URL');

    for (i = 0; i < mainMediaElems.length; i++) {
        mainMediaElem = mainMediaElems[i];
        mainMediaElemOffset = getElementOffset(mainMediaElem);
        if (mainMediaElemOffset.height && mainMediaElemOffset.width) {
            window.GuardianJSInterface.videoPosition(mainMediaElemOffset.left, mainMediaElemOffset.top, mainMediaElemOffset.width, mainMediaElem.getAttribute('href'));
        }
    }

    setTimeout(videoPositioningPoller.bind(null, document.body.offsetHeight), 500);
}

function videoPositioningPoller(pageHeight) {
    const newHeight = document.body.offsetHeight;

    if (pageHeight !== newHeight) {
        reportVideoPositions();
    } else {
        setTimeout(videoPositioningPoller.bind(null, newHeight), 500);
    }
}

function loadEmbeds() {
    var i,
        fenceElems = document.querySelectorAll('iframe.fenced');

    for (i = 0; i < fenceElems.length; i++) {
        render(fenceElems[i]);
    }

    fixVineWidth();
}

function fixVineWidth() {
    let i,
        iframe,
        iframes,
        size,
        srcdoc;

    iframes = document.querySelectorAll('iframe[srcdoc*="https://vine.co"]:not([data-vine-fixed])');

    for (i = 0; i < iframes.length; i++) {
        iframe = iframes[i];
        size = iframe.parentNode.clientWidth;
        srcdoc = iframe.getAttribute('srcdoc');
        srcdoc = srcdoc.replace(/width="[\d]+"/, `width="${size}"`);
        srcdoc = srcdoc.replace(/height="[\d]+"/, `height="${size}"`);
        iframe.setAttribute('srcdoc', srcdoc);
        iframe.dataset.vineFixed = true;
    }
}

function loadInteractives(force) {
    let i,
        bootUrl,
        interactive,
        interactives;

    if ((!GU.opts.isOffline || force) && navigator.onLine) {
        interactives = document.querySelectorAll('figure.interactive');

        for (i = 0; i < interactives.length; i++) {
            interactive = interactives[i];
            bootUrl = interactive.dataset.interactive;

            interactive.classList.add('interactive--loading');

            curl([bootUrl], interactiveObj => {
                startInteractive(interactive, interactiveObj);
            }, showOfflineInteractiveIcons);
        }
    } else {
        showOfflineInteractiveIcons();
    }
}

function startInteractive(interactiveElem, interactiveObj) {
    if (interactiveObj && interactiveObj.boot) {
        interactiveElem.classList.remove('interactive--offline');
        interactiveObj.boot(interactiveElem, document.body);
    }
}

function showOfflineInteractiveIcons() {
    let i,
        interactive,
        reloadElem,
        loadingElem,
        interactives;

    interactives = document.querySelectorAll('figure.interactive:not(.interactive--offline)');

    for (i = 0; i < interactives.length; i++) {
        interactive = interactives[i];
        interactive.classList.add('interactive--offline');

        reloadElem = document.createElement('div');
        reloadElem.classList.add('interactive--offline--icon');
        reloadElem.classList.add('interactive--offline--icon--reload');
        reloadElem.addEventListener('click', loadInteractives.bind(null, true));
        interactive.appendChild(reloadElem);

        loadingElem = document.createElement('div');
        loadingElem.classList.add('interactive--offline--icon');
        loadingElem.classList.add('interactive--offline--icon--loading');
        interactive.appendChild(loadingElem);
    }

    interactives = document.querySelectorAll('figure.interactive.interactive--loading');

    for (i = 0; i < interactives.length; i++) {
        interactive = interactives[i];

        interactive.classList.remove('interactive--loading');
    }
}

function setupGlobals() {
    // Called by native code
    window.offlineSwitch = offlineSwitch;
    window.alertSwitch = alertSwitch;
    window.fontResize = fontResize;
    window.getArticleHeight = getArticleHeight;
    window.videoPositioning = reportVideoPositions;

    window.applyNativeFunctionCall('videoPositioning');
    window.applyNativeFunctionCall('getArticleHeight');
}

function offlineSwitch() {
    GU.opts.isOffline = true;
    document.body.classList.add('offline');
}

function alertSwitch(following, followid) {
    let i,
        followObject,
        followObjects = document.querySelectorAll(`[data-follow-alert-id="${followid}"]`);

    for (i = 0; i < followObjects.length; i++) {
        followObject = followObjects[i];

        if (parseInt(following, 10) === 1) {
            followObject.classList.add('following');
        } else {
            followObject.classList.remove('following');
        }
    }
}

function fontResize(current, replacement) {
    let replacementStr = replacement,
        replacementInt = replacementStr.split('-');

    document.body.classList.remove(current);
    document.body.classList.add(replacement);
    document.body.dataset.fontSize = replacementInt[2];
}

function getArticleHeight() {
    articleHeight(getArticleHeightCallback);
}

function getArticleHeightCallback(height) {
    window.GuardianJSInterface.getArticleHeightCallback(height);
}

function articleHeight(callback) {
    let articleContainer,
        contentType = document.body.getAttribute('data-content-type'),
        height = 0;

    if (contentType === 'article') {
        articleContainer = document.querySelector('div[id$=-article-container]');
        if (articleContainer) {
            height = articleContainer.offsetHeight;
        }
    }

    return callback(height);
}

function showTabs() {
    let i,
        href,
        hideElem,
        tab,
        tabs,
        tabContainer = document.getElementsByClassName('tabs')[0];

    if (tabContainer) {
        tabs = tabContainer.getElementsByTagName('a');

        for (i = 0; i < tabs.length; i++) {
            tab = tabs[i];

            if (i > 0) {
                href = tab.getAttribute('href');
                if (href) {
                    hideElem = document.querySelector(href);
                    if (hideElem) {
                        hideElem.style.display = 'none';
                    }
                }
            }

            tab.addEventListener('click', showTab.bind(null, tab, tabContainer));
        }
    }
}

function showTab(tab, tabContainer, evt) {
    let showElem,
        hideElem,
        href,
        activeTab,
        tabId;

    evt.preventDefault();

    if (tab.getAttribute('aria-selected') !== 'true') {
        activeTab = tabContainer.querySelector('[aria-selected="true"]');
        tabId = tab.getAttribute('id');

        if (activeTab) {
            href = activeTab.getAttribute('href');
            if (href) {
                hideElem = document.querySelector(href);
                if (hideElem) {
                    hideElem.style.display = 'none';
                    activeTab.setAttribute('aria-selected', false);
                }
            }
        }

        href = tab.getAttribute('href');

        if (href) {
            showElem = document.querySelector(href);
            if (showElem) {
                showElem.style.display = 'block';
                tab.setAttribute('aria-selected', true);
            }
        }

        switch (tabId) {
        case 'football__tab--article':
            window.location.href = 'x-gu://football_tab_report';
            break;
        case 'football__tab--stats':
            setPieChartSize();
            window.location.href = 'x-gu://football_tab_stats';
            break;
        case 'football__tab--liveblog':
            window.location.href = 'x-gu://football_tab_liveblog';
            break;
        case 'cricket__tab--liveblog':
            if (GU.opts.platform === 'android') {
                window.GuardianJSInterface.cricketTabChanged('overbyover');
            }
            break;
        case 'cricket__tab--stats':
            if (GU.opts.platform === 'android') {
                window.GuardianJSInterface.cricketTabChanged('scorecard');
            }
            break;
        default:
            window.location.href = 'x-gu://football_tab_unknown';
        }
    }
}

function setPieChartSize() {
    const piechart = document.getElementsByClassName('pie-chart')[0];

    if (piechart && piechart.parentNode) {
        piechart.style.width = `${piechart.parentNode.offsetWidth}px`;
        piechart.style.height = `${piechart.parentNode.offsetWidth}px`;
    }
}

function setGlobalObject() {
    let root = window,
        pageId = document.body.dataset.pageId;

    root.guardian = {
        config: {
            page: {
                pageId: pageId === '__PAGE_ID__' ? null : pageId,
            },
        },
    };
}

function fixSeries() {
    let i,
        lineBreak,
        series = document.querySelector('.content__series-label.content__labels a'),
        spans,
        lineWidth = 0,
        minLastLineWidth = 80;

    if (series) {
        series.innerHTML = `<span>${series.innerText.split(/\s+/).join(' </span><span>')} </span>`;

        spans = series.getElementsByTagName('span');

        for (i = spans.length - 1; i >= 0; i--) {
            lineWidth += spans[i].offsetWidth;
            if (lineWidth > minLastLineWidth) {
                if (Math.abs(spans[i].getBoundingClientRect().top - spans[spans.length - 1].getBoundingClientRect().top) >= spans[i].offsetHeight) {
                    lineBreak = document.createElement('br');
                    spans[i].parentNode.insertBefore(lineBreak, spans[i]);
                }
                break;
            }
        }
    }
}

function advertorialUpdates() {
    if (GU.opts.isAdvertising) {
        /**
         * Remove element with class 'meta'
         * if it's child element with class 'byline' is empty
         * and it has no children with class 'sponsorship'
         */
        let i;
        const metaContainers = document.getElementsByClassName('meta');

        for (i = 0; i < metaContainers.length; i++) {
            const metaContainer = metaContainers[i];
            const bylineElem = metaContainer.getElementsByClassName('byline')[0];

            if (bylineElem &&
                bylineElem.innerHTML === '' &&
                !metaContainer.getElementsByClassName('sponsorship').length) {
                const metaParent = metaContainer.parentNode;

                if (metaParent) {
                    metaParent.removeChild(metaContainer);
                }
            }
        }
    }
}

function setupTracking() {
    let commentCount = document.querySelector('.comment-count a'),
        viewMore = document.getElementsByClassName('comments__viewmore')[0],
        commentContainer = document.getElementsByClassName('comments')[0];

    if (commentCount) {
        commentCount.addEventListener('click', handleCommentCountClick);
    }

    if (viewMore) {
        viewMore.addEventListener('click', viewMoreCommentsClick);
    }

    if (commentContainer) {
        window.addEventListener('scroll', debounce(isCommentContainerInView.bind(null, commentContainer), 100));
    }
}

function handleCommentCountClick(evt) {
    evt.preventDefault();

    signalDevice('trackAction/comments:view more:comment count');
    signalDevice('showcomments');
}

function viewMoreCommentsClick(evt) {
    evt.preventDefault();

    signalDevice('trackAction/comments:view more');
    signalDevice('showcomments');
}

function isCommentContainerInView(commentContainer) {
    if (trackCommentContainerView &&
        isElementPartiallyInViewport(commentContainer)) {
        signalDevice('trackAction/comments:seen');
        trackCommentContainerView = false;
    }
}

export {
    init,
    formatImages,
    loadEmbeds,
    loadInteractives,
    getDesiredImageHeight,
};
