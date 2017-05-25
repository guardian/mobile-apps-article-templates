define([
    'modules/util'
], function (
    util
) {
    'use strict';

    var initialised;

    function formatImmersive() {
        // Override tone to feature for all immersive pages
        document.body.className = document.body.className.replace(/(tone--).+?\s/g, 'tone--feature1 ');

        if (GU.opts.platform !== 'ios') {
            adjustHeaderImageHeight();
        }

        // we actually need for the embed to be sent through with prefixed & unprefixed styles
        if (GU.opts.platform === 'windows') {
            formatImmersiveForWindows();
        }

        // find all the section seperators & add classes
        addClassesToSectionSeparators();
        
        // for each element--immersive add extra classes depending on siblings
        addClassesToElementImmersives();
        
        // store all pullquotes top offset for later
        movePullQuotes();
        
        // attach event handlers
        attachImmersiveEventHandlers();
    }

    function formatImmersiveForWindows() {
        var newSrc,
            iframe = document.querySelector('.article__header-bg .element > iframe');

        if (iframe) {
            newSrc = iframe[0].srcdoc
                .replace('transform: translate(-50%, -50%);', '-webkit-transform: translate(-50%, -50%); transform: translate(-50%, -50%);')
                .replace(/-webkit-animation/g, 'animation')
                .replace(/animation/g, '-webkit-animation')
                .replace(/-webkit-keyframes/g, 'keyframes')
                .replace(/@keyframes/g, '@-webkit-keyframes');
            iframe.srcdoc = newSrc;
        }
    }

    function addClassesToSectionSeparators() {
        var i,
            header,
            headers = document.querySelectorAll('.article h2');

        for (i = 0; i < headers.length; i++) {
            header = headers[i];

            if (header.innerText.trim() === '* * *' || header.classList.contains('section__rule')) {
                header.innerHTML = '';
                header.classList.add('section__rule');
                addDropCapToNextElementSibling(header);
            }
        }
    }

    function addDropCapToNextElementSibling(element) {
        var nextParagraphSibling = element.nextElementSibling;

        if (nextParagraphSibling &&
            nextParagraphSibling.tagName === 'P' && 
            nextParagraphSibling.firstChild && 
            nextParagraphSibling.firstChild.tagName !== 'STRONG') {
            nextParagraphSibling.classList.add('has__dropcap');
        }
    }

    function addClassesToElementImmersives() {
        var i,
            elementImmersive,
            elementImmersives = document.querySelectorAll('figure.element--immersive'),
            nextSibling;

        for (i = 0; i < elementImmersives.length; i++) {
            elementImmersive = elementImmersives[i];

            nextSibling = elementImmersive.nextElementSibling;
            
            if (nextSibling &&
                nextSibling.classList.contains('element-pullquote')) {
                nextSibling.classList.add('quote--image');
                elementImmersive.classList.add('quote--overlay');
                elementImmersive.dataset.thing = '';
            }

            if (nextSibling &&
                nextSibling.tagName === 'H2' &&
                !nextSibling.classList.contains('section__rule')) {
                elementImmersive.classList.add('title--overlay');
                nextSibling.classList.add('title--image');

                addDropCapToNextElementSibling(nextSibling);
            }
        }
    }

    function movePullQuotes() {
        var i,
            pullQuote,
            pullQuotes = document.getElementsByClassName('element-pullquote');

        for (i = 0; i < pullQuotes.length; i++) {
            pullQuote = pullQuotes[i];
            pullQuote.dataset.offset = util.getElementOffset(pullQuote).top;
        }
    }

    function attachImmersiveEventHandlers() {
        var i,
            quoteOverlay,
            quoteOverlays = document.getElementsByClassName('quote--overlay');
            
        for (i = 0; i < quoteOverlays.length; i++) {
            quoteOverlay = quoteOverlays[i];
            quoteOverlay.addEventListener('click', onQuoteOverlayClick.bind(null, quoteOverlay));
        }

        window.addEventListener('scroll', util.debounce(onImmersiveScroll, 10));
        
        if (GU.opts.platform !== 'ios') {
            window.addEventListener('resize', util.debounce(adjustHeaderImageHeight, 100));
        }
    }

    function onQuoteOverlayClick(quoteOverlay, evt) {
        var figcaption;

        evt.preventDefault();

        figcaption = quoteOverlay.getElementsByTagName('figcaption')[0];

        if (figcaption) {
            if (figcaption.classList.contains('display')) {
                figcaption.classList.remove('display');
            } else {
                figcaption.classList.add('display');
            }
        }
    }

    function onImmersiveScroll() {
        var i,
            dataOffset,
            pullQuote,
            pullQuotes = document.getElementsByClassName('element-pullquote'),
            viewPortHeight = document.documentElement.clientHeight,
            pageOffset = viewPortHeight * 0.75;

        for (i = 0; i < pullQuotes.length; i++) {
            pullQuote = pullQuotes[i];
            dataOffset = pullQuote.dataset.offset;

            if (window.scrollY >= (dataOffset - pageOffset)) {
                pullQuote.classList.add('animated');
                pullQuote.classList.add('fadeInUp');
            }
        }
    }

    function adjustHeaderImageHeight() {
        var embed,
            headerContainer = document.querySelector('.article__header-bg, .article__header-bg .element > iframe');

        if (headerContainer) {
            embed = headerContainer.getElementsByClassName('element-embed')[0] || headerContainer.getElementsByClassName('element-atom')[0];
            if (embed || headerContainer.dataset.fullScreen) {
                headerContainer.style.height = getImageHeight() + 'px';
                if (embed) {
                    embed.classList.add('height-adjusted');
                }
            }
        }
    }

    function getImageHeight() {
        var viewPortHeight = document.documentElement.clientHeight,
            marginTop = document.body.style.marginTop.replace('px', '');

        return viewPortHeight - marginTop;
    }

    function init() {
        if (!initialised) {
            formatImmersive();
            initialised = true;
        }
    }

    return {
        init: init
    };
});