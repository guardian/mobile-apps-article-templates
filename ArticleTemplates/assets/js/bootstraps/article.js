define([
    'modules/twitter',
    'modules/witness',
    'modules/outbrain',
    'modules/quiz',
    'modules/membership'
], function (
    twitter,
    witness,
    outbrain,
    quiz,
    membership
) {
    'use strict';

    function init() {
        twitter.init();
        witness.duplicate();
        insertOutbrain();
        loadQuizzes();
        formatImmersive();
        richLinkTracking();
        loadMembershipCreative();
    }

    function insertOutbrain() {
        window.articleOutbrainInserter = loadOutbrain;
        window.applyNativeFunctionCall('articleOutbrainInserter');
    }

    function loadOutbrain() {
        outbrain.init();
    }

    function loadQuizzes() {
        quiz.init();
    }

    function formatImmersive() {
        var immersives = document.getElementsByClassName('immersive');

        if (immersives.length) {
            // Override tone to feature for all immersive pages
            document.body.className = document.body.className.replace(/(tone--).+?\s/g, 'tone--feature1 ');

            adjustHeaderImageHeight();

            // we actually need for the embed to be sent through with prefixed & unprefixed styles
            if (document.body.classList.contains('windows')) {
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

            if (header.innerHTML.trim() === '* * *') {
                header.innerHTML = '';
                header.classList.add('section__rule');
                if (header.nextElementSibling) {
                    header.nextElementSibling.classList.add('has__dropcap');
                }
            }
        }
    }

    function addClassesToElementImmersives() {
        var i,
            elementImmersive,
            elementImmersives = document.querySelectorAll('figure.element--immersive');

        for (i = 0; i < elementImmersives.length; i++) {
            elementImmersive = elementImmersives[i];
            if (elementImmersive.nextElementSibling &&
                elementImmersive.nextElementSibling.classList.contains('element-pullquote')) {
                elementImmersive.nextElementSibling.classList.add('quote--image');
                elementImmersive.classList.add('quote--overlay');
                elementImmersive.dataset.thing = '';
            }

            if (elementImmersive.nextElementSibling &&
                elementImmersive.nextElementSibling.tagName === 'H2') {
                elementImmersive.nextElementSibling.classList.add('title--image');
                elementImmersive.classList.add('title--overlay');
                if (elementImmersive.nextElementSibling.nextElementSibling) {
                    elementImmersive.nextElementSibling.nextElementSibling.classList.add('has__dropcap');
                }
            }
        }
    }

    function movePullQuotes() {
        var i,
            pullQuote,
            pullQuotes = document.getElementsByClassName('element-pullquote');

        for (i = 0; i < pullQuotes.length; i++) {
            pullQuote = pullQuotes[i];
            pullQuote.dataset.offset = GU.util.getElementOffset(pullQuote).top;
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

        window.addEventListener('scroll', GU.util.debounce(onImmersiveScroll, 10));
        window.addEventListener('resize', GU.util.debounce(onResize, 100));
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

    function onResize() {
        adjustHeaderImageHeight();
    }

    function adjustHeaderImageHeight() {
        var embed,
            viewPortHeight,
            bgHeight,
            headerContainer;

        viewPortHeight = document.documentElement.clientHeight;
        bgHeight = (viewPortHeight - document.body.style.marginTop.replace('px', '')) + 'px';
        headerContainer = document.querySelector('.article__header-bg, .article__header-bg .element > iframe');

        if (headerContainer) {
            embed = headerContainer.getElementsByClassName('element-embed')[0];
            if (embed || headerContainer.dataset.fullScreen) {
                headerContainer.style.height = bgHeight;
                if (embed) {
                    embed.classList.add('height-adjusted');
                }
            }
        }
    }

    function richLinkTracking() {
        var i,
            j,
            href,
            link,
            links,
            richLink,
            richLinks = document.getElementsByClassName('element-rich-link');

        for (i = 0; i < richLinks.length; i++) {
            richLink = richLinks[i];
            links = richLink.getElementsByTagName('a');

            for (j = 0; j < links.length; j++) {
                link = links[j];
                href = link.getAttribute('href');
                if (href !== '') {
                    link.setAttribute('href', href + '?ArticleReferrer=RichLink');
                }
            }
        }
    }

    function loadMembershipCreative() {
        membership.init();
    }
    
    return {
        init: init
    };
});