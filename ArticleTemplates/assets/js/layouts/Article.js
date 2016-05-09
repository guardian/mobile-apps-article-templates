/*global window,document,define */
define([
    'layouts/Layout',
    'modules/twitter',
    'modules/witness',
    'modules/outbrain',
    'modules/quiz',
    'modules/MembershipCreative'
], function (
    Layout,
    twitter,
    witness,
    outbrain,
    quiz,
    MembershipCreative
) {
    'use strict';

    var Article = Layout.extend({
        init: function () {
            this._super.apply(this, arguments);
            twitter.init();
            twitter.enhanceTweets();
            witness.duplicate();
            this.insertOutbrain();
            this.loadQuizzes();
            this.formatImmersive();
            this.richLinkTracking();
            this.loadMembershipCreative();
        },

        insertOutbrain: function () {
            window.articleOutbrainInserter = this.loadOutbrain;
            window.applyNativeFunctionCall('articleOutbrainInserter');
        },

        loadOutbrain: function () {
            outbrain.load();
        },

        loadQuizzes: function () {
            quiz.init();
        },

        formatImmersive: function () {
            var immersives = document.querySelectorAll('.immersive');

            if (immersives.length) {
                // Override tone to feature for all immersive pages
                document.body.className = document.body.className.replace(/(tone--).+?\s/g, 'tone--feature1 ');

                this.adjustHeaderImageHeight();

                // we actually need for the embed to be sent through with prefixed & unprefixed styles
                if (document.body.classList.contains('windows')) {
                    this.formatImmersiveForWindows();
                }

                // find all the section seperators & add classes
                this.addClassesToSectionSeparators();

                // for each element--immersive add extra classes depending on siblings
                this.addClassesToElementImmersives();

                // store all pullquotes top offset for later
                this.movePullQuotes();

                // attach event handlers
                this.attachImmersiveEventHandlers();
            }
        },

        formatImmersiveForWindows: function () {
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
        },

        addClassesToSectionSeparators: function () {
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
        },

        addClassesToElementImmersives: function () {
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
        },

        movePullQuotes: function () {
            var i,
                pullQuote,
                pullQuotes = document.querySelectorAll('.element-pullquote');

            for (i = 0; i < pullQuotes.length; i++) {
                pullQuote = pullQuotes[i];
                pullQuote.dataset.offset = pullQuote.offsetTop;
            }
        },

        attachImmersiveEventHandlers: function () {
            var i,
                quoteOverlay,
                quoteOverlays = document.querySelectorAll('.quote--overlay'),
                onImmersiveScrollBound = this.onImmersiveScroll.bind(this),
                onResizeBound = this.onResize.bind(this);

            for (i = 0; i < quoteOverlays.length; i++) {
                quoteOverlay = quoteOverlays[i];
                quoteOverlay.addEventListener('click', this.onQuoteOverlayClick.bind(this, quoteOverlay));
            }

            window.addEventListener('scroll', GU.util.debounce(onImmersiveScrollBound), 10);
            window.addEventListener('resize', GU.util.debounce(onResizeBound), 100);
        },

        onQuoteOverlayClick: function (quoteOverlay, evt) {
            var figcaption;

            evt.preventDefault();

            figcaption = quoteOverlay.querySelector('figcaption');

            if (figcaption) {
                if (figcaption.classList.contains('display')) {
                    figcaption.classList.remove('display');
                } else {
                    figcaption.classList.add('display');
                }
            }
        },

        onImmersiveScroll: function () {
            var i,
                dataOffset,
                pullQuote,
                pullQuotes = document.querySelectorAll('.element-pullquote'),
                viewPortHeight = document.documentElement.clientHeight,
                pageOffset = viewPortHeight * 0.75;

            for (i = 0; i < pullQuotes.length; i++) {
                pullQuote = pullQuotes[i];
                dataOffset = pullQuote.dataset.offset;

                if (window.scrollY >= (dataOffset - pageOffset)) {
                    pullQuote.classList.add('animated', 'fadeInUp');
                }
            }
        },

        onResize: function () {
            this.adjustHeaderImageHeight();
        },

        adjustHeaderImageHeight: function () {
            var viewPortHeight,
                bgHeight,
                headerImage;

            viewPortHeight = document.documentElement.clientHeight;
            bgHeight = (viewPortHeight - document.body.style.marginTop.replace('px', '')) + 'px';
            headerImage = document.querySelector('.article__header-bg, .article__header-bg .element > iframe');

            if (headerImage) {
                headerImage.style.height = bgHeight;
            }
        },

        richLinkTracking: function () {
            var i,
                j,
                href,
                link,
                links,
                richLink,
                richLinks = document.querySelectorAll('.element-rich-link');

            for (i = 0; i < richLinks.length; i++) {
                richLink = richLinks[i];
                links = richLink.querySelectorAll('a');

                for (j = 0; j < links.length; j++) {
                    link = links[j];
                    href = link.getAttribute('href');
                    if (href !== '') {
                        link.setAttribute('href', href + '?ArticleReferrer=RichLink');
                    }
                }
            }
        },

        loadMembershipCreative: function () {
            var membershipCreative;

            membershipCreative = new MembershipCreative();
        }
    });

    return Article;
});