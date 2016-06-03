define([
    'fence',
    'fastClick',
    'smoothScroll',
    'flipSnap',
    'modules/comments',
    'modules/cards',
    'modules/more-tags',
    'modules/sharing'
], function(
    fence,
    fastClick,
    smoothScroll,
    flipSnap,
    comments,
    cards,
    moreTags,
    sharing
) {
    'use strict';

    var isAndroid;

    function init() {
        isAndroid = document.body.classList.contains('android');

        attachFastClick();
        hideEmptyCaptions();
        figcaptionToggle();
        imageSizer();
        articleContentType();
        insertTags();
        videoPositioning();
        comments.init();
        cards.init();
        loadEmbeds();
        smoothScroll.init();
        loadInteractives();
        offline();
        setupOfflineSwitch();
        setupAlertSwitch();
        setupTellMeWhenSwitch();
        setupFontSizing();
        setupGetArticleHeight();
        showTabs();
        setGlobalObject(window);
        fixSeries();
        formatThumbnailImages();
        advertorialUpdates();
        sharing.init(window);

        if (!document.body.classList.contains('no-ready')) {
            window.location.href = 'x-gu://ready';
        }
    }

    function attachFastClick() {
        // Polyfill to remove click delays on browsers with touch UIs
        fastClick.attach(document.body);
    }

    function hideEmptyCaptions() {
        var i,
            figcaption,
            figures = document.getElementsByTagName('figure');

        for (i = 0; i < figures.length; i++) {
            figcaption = figures[i].querySelector('figcaption');
            
            if (figcaption && figcaption.innerText === '') {
                figcaption.style.display = 'none';
            }
        }
    }

    function figcaptionToggle() {
        var toggleCaptionVisibilityBound,
            mainMediaCaption = document.querySelector('.main-media__caption__icon'),
            mainMediaCaptionText = document.querySelector('.main-media__caption__text');
            
        if (mainMediaCaption && mainMediaCaptionText) {
            toggleCaptionVisibilityBound = toggleCaptionVisibility.bind(null, mainMediaCaptionText);
            mainMediaCaption.addEventListener('click', toggleCaptionVisibilityBound);
        }
    }

    function toggleCaptionVisibility(mainMediaCaptionText) {
        var className = 'is-visible';

        if (mainMediaCaptionText.classList.contains(className)) {
            mainMediaCaptionText.classList.remove(className);
        } else {
            mainMediaCaptionText.classList.add(className);
        }
    }

    function imageSizer() {
        var i,
            figure,
            figures,
            isThumbnail,
            caption,
            imageClass,
            imageOrLinkedImage,
            imageWrapper, 
            captionIcon;

        figures = document.querySelectorAll('figure.element-image');

        for (i = 0; i < figures.length; i++) {
            figure = figures[i];
            isThumbnail = figure.classList.contains('element--thumbnail');
            caption = figure.querySelector('.element-image__caption');
            imageClass = isThumbnail && caption ? 'figure--thumbnail-with-caption' : (isThumbnail ? 'figure--thumbnail' : 'figure-wide');
        
            figure.classList.add(imageClass);

            imageOrLinkedImage = figure.children[0];

            if (imageOrLinkedImage && 
                !imageOrLinkedImage.classList.contains('figure__inner')) {

                imageWrapper = document.createElement('div');
                imageWrapper.classList.add('figure__inner');
                imageWrapper.appendChild(imageOrLinkedImage);

                figure.insertBefore(imageWrapper, figure.firstChild);
            }

            captionIcon = figure.querySelector('.figure__caption__icon');

            if (caption && !captionIcon) {
                caption.innerHTML = '<span data-icon="&#xe044;" class="figure__caption__icon" aria-hidden="true"></span>' + caption.innerHTML;
            }
        }
    }

    function articleContentType() {
        var i,
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
        var tagsList = document.querySelector('.tags .inline-list');

        if (tagsList) {
            tagsList.innerHTML += html;
        }

        moreTags.refresh();
    }

    function videoPositioning() {
        window.videoPositioning = reportVideoPositions;
        window.applyNativeFunctionCall('videoPositioning');
    }

    function reportVideoPositions() {
        var i,
            mainMediaElem,
            mainMediaElemOffset,
            mainMediaElems = document.getElementsByClassName('video-URL');

        for (i = 0; i < mainMediaElems.length; i++) {
            mainMediaElem = mainMediaElems[i];
            mainMediaElemOffset = GU.util.getElementOffset(mainMediaElem);
            window.GuardianJSInterface.videoPosition(mainMediaElemOffset.left, mainMediaElemOffset.top, mainMediaElemOffset.width, mainMediaElem.getAttribute('href'));
        }

        setTimeout(videoPositioningPoller.bind(null, document.body.offsetHeight), 500);
    }

    function videoPositioningPoller(pageHeight) {
        var newHeight = document.body.offsetHeight;

        if(pageHeight !== newHeight) {
            reportVideoPositions();
        } else {
            setTimeout(videoPositioningPoller.bind(null, newHeight), 500);
        }  
    }

    function loadEmbeds() {
        var i, 
            fenceElems;

        fixVineWidth();

        require(['fence'], function(fence) {
            fenceElems = document.querySelectorAll('iframe.fenced');

            for (i = 0; i < fenceElems.length; i++) {
                fence.render(fenceElems[i]);
            }
        });
    }

    function fixVineWidth() {
        var i,
            iframe,
            iframes,
            size,
            srcdoc;

        iframes = document.querySelectorAll('iframe[srcdoc*="https://vine.co"]:not([data-vine-fixed])');

        for (i = 0; i < iframes.length; i++) {
            iframe = iframes[i];
            size = iframe.parentNode.clientWidth;
            srcdoc = iframe.getAttribute('srcdoc');
            srcdoc = srcdoc.replace(/width="[\d]+"/,'width="' + size + '"');
            srcdoc = srcdoc.replace(/height="[\d]+"/,'height="' + size + '"');
            iframe.setAttribute('srcdoc', srcdoc);
            iframe.dataset.vineFixed = true;
        }
    }

    function loadInteractives(force) {
        var i,
            bootUrl,
            interactive,
            interactives;

        if ((!document.body.classList.contains('offline') || force) && navigator.onLine) {
            interactives = document.querySelectorAll('figure.interactive');

            for (i = 0; i < interactives.length; i++) {
                interactive = interactives[i];
                bootUrl = interactive.dataset.interactive;

                // The contract here is that the interactive module MUST return an object
                // with a method called 'boot'.
                require.undef(bootUrl);
                interactive.classList.add('interactive--loading');

                require([bootUrl], startInteractive.bind(null, interactive), showOfflineInteractiveIcons);
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
        var i,
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

    function offline() {
        var i,
            dummyImage,
            image,
            images;

        if (document.body.classList.contains('offline')) {
            images = document.querySelectorAll('.article img');

            for (i = 0; i < images.length; i++) {
                image = images[i];
                dummyImage = new Image();
                dummyImage.onerror = hideImageOnError.bind(null, image);
                dummyImage.src = image.getAttribute('src');
            }
        }
    }

    function hideImageOnError(image) {
        var innerElem;

        if (image.parentNode.classList.contains('element-image-inner')) {
            image.style.display = 'none';
        } else {
            innerElem = document.createElement('div');
            innerElem.classList.add('element-image-inner');
            image.parentNode.replaceChild(innerElem, image);
        }
    }

    function setupOfflineSwitch() {
        // Called by native code
        window.offlineSwitch = offlineSwitch;
    }

    function offlineSwitch() {
        document.body.classList.add('offline');
    }

    function setupAlertSwitch() {
        // Called by native code
        window.alertSwitch = alertSwitch;
    }

    function alertSwitch(following, followid) {
        var i,
            followObject,
            followObjects = document.querySelectorAll('[data-follow-alert-id="' + followid + '"]');

        for (i = 0; i < followObjects.length; i++) {
            followObject = followObjects[i];

            if (following === 1) {
                followObject.classList.add('following');
            } else {
                followObject.classList.remove('following');
            }
        }
    }

    function setupTellMeWhenSwitch() {
        // Called by native code
        window.tellMeWhenSwitch = tellMeWhenSwitch;
    }

    function tellMeWhenSwitch(added) {
        var i,
            tellMeWhenLink,
            tellMeWhenLinks = document.querySelectorAll('a.tell-me-when');

        for (i = 0; i < tellMeWhenLinks.length; i++) {
            tellMeWhenLink = tellMeWhenLinks[i];

            if (added === 1) {
                tellMeWhenLink.classList.add('added');
            } else {
                tellMeWhenLink.classList.remove('added');
            }
        }
    }

    function setupFontSizing() {
        // Called by native code
        window.fontResize = fontResize;
    }

    function fontResize(current, replacement) {
        var replacementStr = replacement,
            replacementInt = replacementStr.split('-');

        document.body.classList.remove(current);
        document.body.classList.add(replacement);  
        document.body.dataset.fontSize = replacementInt[2];
    }

    function setupGetArticleHeight() {
        // Called by native code
        window.getArticleHeight = getArticleHeight;
        window.applyNativeFunctionCall('getArticleHeight');
    }

    function getArticleHeight() {
        articleHeight(getArticleHeightCallback);
    }

    function getArticleHeightCallback(height) {
        window.GuardianJSInterface.getArticleHeightCallback(height);
    }

    function articleHeight(callback) {
        var articleContainer,
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
        var i,
            href,
            hideElem,
            tab,
            tabs,
            tabContainer = document.querySelector('.tabs');

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
        var showElem,
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

            switch(tabId) {
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
                    if (isAndroid) {
                        window.GuardianJSInterface.cricketTabChanged('overbyover');
                    }
                    break;
                case 'cricket__tab--stats':
                    if (isAndroid) {
                        window.GuardianJSInterface.cricketTabChanged('scorecard');
                    }
                    break;
                default:
                    window.location.href = 'x-gu://football_tab_unknown';
            }
        }
    }

    function setPieChartSize() {
        var piechart = document.querySelector('.pie-chart');

        if (piechart && piechart.parentNode) {
            piechart.style.width = piechart.parentNode.offsetWidth + 'px';
            piechart.style.height = piechart.parentNode.offsetWidth + 'px';
        }
    }

    function setGlobalObject(root) {
        var pageId = document.body.dataset.pageId;

        root.guardian = {
            config: {
                page: {
                    pageId: pageId === '__PAGE_ID__' ? null : pageId
                }
            }
        };

        return root.guardian;            
    }

    function fixSeries() {
        var i,
            lineBreak,
            series = document.querySelector('.content__series-label.content__labels a'),
            spans,
            lineWidth = 0,
            minLastLineWidth = 80;

        if (series) {
            series.innerHTML = '<span>' + series.innerText.split(/\s+/).join(' </span><span>') + ' </span>';

            spans = series.querySelectorAll('span');

            for (i = spans.length - 1; i >=0; i--) {
                lineWidth = lineWidth + spans[i].offsetWidth;
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

    function formatThumbnailImages() {
        var i,
            isPortrait,
            thumbnailImage,
            thumbnailFigures = document.getElementsByClassName('element-image element--thumbnail');

        for (i = 0; i < thumbnailFigures.length; i++) {
            thumbnailImage = thumbnailFigures[i].getElementsByTagName('img')[0];
            isPortrait = parseInt(thumbnailImage.getAttribute('height'), 10) > parseInt(thumbnailImage.getAttribute('width'), 10);

            if (isPortrait) {
                thumbnailFigures[i].classList.add('portrait-thumbnail');
            } else {
                thumbnailFigures[i].classList.add('landscape-thumbnail');
            }
        }
    }

    function advertorialUpdates() {
        var tones, tone, type, 
            parentNodeClass, bylineElems, 
            elemsToDelete, j;

        tones = {
            'tone--media': {
                'video': 'meta__misc',
                'gallery': 'meta__misc',
                'audio': 'byline--mobile'
            },
            'tone--news': 'meta',
            'tone--feature1': 'meta',
            'tone--feature2': 'meta',
            'tone--feature3': 'meta',
            'tone--podcast': 'byline--media'
        };

        if (document.body.classList.contains('is_advertising')) {
            for (tone in tones) {
                if (tones.hasOwnProperty(tone)) {
                    if (document.body.classList.contains(tone)) {
                        if (typeof tones[tone] === 'object') {
                            for (type in tones[tone]) {
                                if (tones[tone].hasOwnProperty(type)) {
                                    if (document.body.dataset.contentType && document.body.dataset.contentType === type) {
                                        parentNodeClass = tones[tone][type];
                                        break;
                                    }
                                }
                            }
                        } else {
                            parentNodeClass = tones[tone];
                            break;
                        }
                    }
                }
            }

            if (parentNodeClass) {
                bylineElems = document.getElementsByClassName('byline');
                if (bylineElems.length && !bylineElems[0].children.length) {
                    elemsToDelete = document.body.getElementsByClassName(parentNodeClass);
                    for (j = 0; j < elemsToDelete.length; j++) {
                        if (elemsToDelete[j].parentNode && !elemsToDelete[j].getElementsByClassName('sponsorship').length) {
                            elemsToDelete[j].parentNode.removeChild(elemsToDelete[j]);
                        }
                    }
                }
            }
        }
    }

    return {
        init: init,
        imageSizer: imageSizer,
        loadEmbeds: loadEmbeds,
        loadInteractives: loadInteractives
    };
});