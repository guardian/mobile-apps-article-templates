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
    Comments,
    Cards,
    MoreTags,
    Sharing
) {
    'use strict';

    var module = {
        init: function() {
            module.isAndroid = document.body.classList.contains('android');

            module.attachFastClick();
            module.hideEmptyCaptions();
            module.figcaptionToggle();
            module.imageSizer();
            module.articleContentType();
            module.insertTags();
            module.videoPositioning();
            module.loadComments();
            module.loadCards();
            module.loadEmbeds();
            module.scrollToAnchor();
            module.loadInteractives();
            module.offline();
            module.setupOfflineSwitch();
            module.setupAlertSwitch();
            module.setupTellMeWhenSwitch();
            module.setupFontSizing();
            module.setupGetArticleHeight();
            module.showTabs();
            module.setGlobalObject(window);
            module.fixSeries();
            module.formatThumbnailImages();
            module.advertorialUpdates();

            Sharing.init(window);

            if (!document.body.classList.contains('no-ready')) {
                window.location.href = 'x-gu://ready';
            }
        },

        attachFastClick: function() {
            // Polyfill to remove click delays on browsers with touch UIs
            fastClick.attach(document.body);
        },

        hideEmptyCaptions: function() {
            var i,
                figcaption,
                figures = document.getElementsByTagName('figure');

            for (i = 0; i < figures.length; i++) {
                figcaption = figures[i].querySelector('figcaption');
                
                if (figcaption && figcaption.innerText === '') {
                    figcaption.style.display = 'none';
                }
            }
        },

        figcaptionToggle: function () {
            var toggleCaptionVisibilityBound,
                mainMediaCaption = document.querySelector('.main-media__caption__icon'),
                mainMediaCaptionText = document.querySelector('.main-media__caption__text');
                
            if (mainMediaCaption && mainMediaCaptionText) {
                toggleCaptionVisibilityBound = module.toggleCaptionVisibility.bind(null, mainMediaCaptionText);
                mainMediaCaption.addEventListener('click', toggleCaptionVisibilityBound);
            }
        },

        toggleCaptionVisibility: function (mainMediaCaptionText) {
            var className = 'is-visible';

            if (mainMediaCaptionText.classList.contains(className)) {
                mainMediaCaptionText.classList.remove(className);
            } else {
                mainMediaCaptionText.classList.add(className);
            }
        },

        imageSizer: function () {
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
        },

        articleContentType: function () {
            var i,
                proseElem,
                proseElems = document.querySelectorAll('.article__body > .prose');

            for (i = 0; i < proseElems.length; i++) {
                proseElem = proseElems[i];

                if (proseElem.querySelectorAll('.figure--thumbnail:not(.figure--thumbnail-with-caption)').length) {
                    proseElem.classList.add('prose--is-panel');
                }
            }
        },

        insertTags: function () {
            window.articleTagInserter = module.articleTagInserter;
            window.applyNativeFunctionCall('articleTagInserter');
        },

        articleTagInserter: function (html) {
            var tagsList = document.querySelector('.tags .inline-list');

            if (tagsList) {
                tagsList.innerHTML += html;
            }

            MoreTags.refresh();
        },

        videoPositioning: function () {
            window.videoPositioning = module.reportVideoPositions;
            window.applyNativeFunctionCall('videoPositioning');
        },

        reportVideoPositions: function () {
            var i,
                mainMediaElem,
                mainMediaElemRect,
                mainMediaElems = document.getElementsByClassName('video-URL');

            for (i = 0; i < mainMediaElems.length; i++) {
                mainMediaElem = mainMediaElems[i];
                mainMediaElemRect = mainMediaElem.getBoundingClientRect();
                window.GuardianJSInterface.videoPosition(mainMediaElemRect.left, mainMediaElemRect.top, mainMediaElemRect.width, mainMediaElem.getAttribute('href'));
            }

            setTimeout(module.videoPositioningPoller.bind(null, document.body.offsetHeight), 500);
        },

        videoPositioningPoller: function (pageHeight) {
            var newHeight = document.body.offsetHeight;

            if(pageHeight !== newHeight) {
                module.reportVideoPositions();
            } else {
                setTimeout(module.videoPositioningPoller.bind(null, newHeight), 500);
            }  
        },

        loadComments: function () {
            Comments.init();
        },

        loadCards: function () {
            Cards.init();
        },

        loadEmbeds: function () {
            var i, 
                fenceElems;

            module.fixVineWidth();

            require(['fence'], function(fence) {
                fenceElems = document.querySelectorAll('iframe.fenced');

                for (i = 0; i < fenceElems.length; i++) {
                    fence.render(fenceElems[i]);
                }
            });
        },

        fixVineWidth: function () {
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
        },

        scrollToAnchor: function () {
            smoothScroll.init();
        },

        loadInteractives: function (force) {
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

                    require([bootUrl], module.startInteractive.bind(null, interactive), module.showOfflineInteractiveIcons);
                }
            } else {
                module.showOfflineInteractiveIcons();
            }
        },

        startInteractive: function (interactiveElem, interactiveObj) {
            if (interactiveObj && interactiveObj.boot) {
                interactiveElem.classList.remove('interactive--offline');
                interactiveObj.boot(interactiveElem, document.body);
            }
        },

        showOfflineInteractiveIcons: function () {
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
                reloadElem.classList.add('interactive--offline--icon', 'interactive--offline--icon--reload');
                reloadElem.addEventListener('click', module.loadInteractives.bind(null, true));
                interactive.appendChild(reloadElem);

                loadingElem = document.createElement('div');
                loadingElem.classList.add('interactive--offline--icon', 'interactive--offline--icon--loading');
                interactive.appendChild(loadingElem);
            }

            interactives = document.querySelectorAll('figure.interactive.interactive--loading');

            for (i = 0; i < interactives.length; i++) {
                interactive = interactives[i];

                interactive.classList.remove('interactive--loading');
            }
        },

        offline: function () {
            var i,
                dummyImage,
                image,
                images;

            if (document.body.classList.contains('offline')) {
                images = document.querySelectorAll('.article img');

                for (i = 0; i < images.length; i++) {
                    image = images[i];
                    dummyImage = new Image();
                    dummyImage.onerror = module.hideImageOnError.bind(null, image);
                    dummyImage.src = image.getAttribute('src');
                }
            }
        },

        hideImageOnError: function (image) {
            var innerElem;

            if (image.parentNode.classList.contains('element-image-inner')) {
                image.style.display = 'none';
            } else {
                innerElem = document.createElement('div');
                innerElem.classList.add('element-image-inner');
                image.parentNode.replaceChild(innerElem, image);
            }
        },

        setupOfflineSwitch: function () {
            // Called by native code
            window.offlineSwitch = module.offlineSwitch;
        },

        offlineSwitch: function () {
            document.body.classList.add('offline');
        },

        setupAlertSwitch: function () {
            // Called by native code
            window.alertSwitch = module.alertSwitch;
        },

        alertSwitch: function (following, followid) {
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
        },

        setupTellMeWhenSwitch: function () {
            // Called by native code
            window.tellMeWhenSwitch = module.tellMeWhenSwitch;
        },

        tellMeWhenSwitch: function (added) {
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
        },

        setupFontSizing: function () {
            // Called by native code
            window.fontResize = module.fontResize;
        },

        fontResize: function (current, replacement) {
            var replacementStr = replacement,
                replacementInt = replacementStr.split('-');

            document.body.classList.remove(current);
            document.body.classList.add(replacement);  
            document.body.dataset.fontSize = replacementInt[2];
        },

        setupGetArticleHeight: function () {
            // Called by native code
            window.getArticleHeight = module.getArticleHeight;
            window.applyNativeFunctionCall('getArticleHeight');
        },

        getArticleHeight: function () {
            module.articleHeight(module.getArticleHeightCallback);
        },

        getArticleHeightCallback: function (height) {
            window.GuardianJSInterface.getArticleHeightCallback(height);
        },

        articleHeight: function(callback) {
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
        },

        showTabs: function () {
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

                    tab.addEventListener('click', module.showTab.bind(null, tab, tabContainer));
                }
            }
        },

        showTab: function (tab, tabContainer, evt) {
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
                        module.setPieChartSize();
                        window.location.href = 'x-gu://football_tab_stats';
                        break;
                    case 'football__tab--liveblog':
                        window.location.href = 'x-gu://football_tab_liveblog';
                        break;
                    case 'cricket__tab--liveblog':
                        if (module.isAndroid) {
                            window.GuardianJSInterface.cricketTabChanged('overbyover');
                        }
                        break;
                    case 'cricket__tab--stats':
                        if (module.isAndroid) {
                            window.GuardianJSInterface.cricketTabChanged('scorecard');
                        }
                        break;
                    default:
                        window.location.href = 'x-gu://football_tab_unknown';
                }
            }
        },

        setPieChartSize: function () {
            var piechart = document.querySelector('.pie-chart');

            if (piechart && piechart.parentNode) {
                piechart.style.width = piechart.parentNode.offsetWidth + 'px';
                piechart.style.height = piechart.parentNode.offsetWidth + 'px';
            }
        },

        setGlobalObject: function (root) {
            var pageId = document.body.dataset.pageId;

            root.guardian = {
                config: {
                    page: {
                        pageId: pageId === '__PAGE_ID__' ? null : pageId
                    }
                }
            };

            return root.guardian;            
        },

        fixSeries: function () {
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
        },

        formatThumbnailImages: function() {
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
        },

        advertorialUpdates: function() {
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
    };

    return module;
});