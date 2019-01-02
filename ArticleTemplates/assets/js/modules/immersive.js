import { getElementOffset, debounce } from 'modules/util';

function formatImmersive() {
    if (GU.opts.platform !== 'ios') {
        adjustHeaderImageHeight();
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

function addClassesToSectionSeparators() {
    let i;
    let header;
    const headers = document.querySelectorAll('.article h2');

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
    const nextParagraphSibling = element.nextElementSibling;

    if (nextParagraphSibling &&
        nextParagraphSibling.tagName === 'P' &&
        nextParagraphSibling.firstChild &&
        nextParagraphSibling.firstChild.tagName !== 'STRONG') {
        nextParagraphSibling.classList.add('has__dropcap');
    }
}

function addClassesToElementImmersives() {
    let i;
    let elementImmersive;
    const elementImmersives = document.querySelectorAll('figure.element--immersive');
    let nextSibling;

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
    let i;
    let pullQuote;
    const pullQuotes = document.getElementsByClassName('element-pullquote');

    for (i = 0; i < pullQuotes.length; i++) {
        pullQuote = pullQuotes[i];
        pullQuote.dataset.offset = getElementOffset(pullQuote).top;
    }
}

function attachImmersiveEventHandlers() {
    let i;
    let quoteOverlay;
    const quoteOverlays = document.getElementsByClassName('quote--overlay');

    for (i = 0; i < quoteOverlays.length; i++) {
        quoteOverlay = quoteOverlays[i];
        quoteOverlay.addEventListener('click', onQuoteOverlayClick.bind(null, quoteOverlay));
    }

    window.addEventListener('scroll', debounce(onImmersiveScroll, 10));

    if (GU.opts.platform !== 'ios') {
        window.addEventListener('resize', debounce(adjustHeaderImageHeight, 100));
    }
}

function onQuoteOverlayClick(quoteOverlay, evt) {
    let figcaption;

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
    let i;
    let dataOffset;
    let pullQuote;
    const pullQuotes = document.getElementsByClassName('element-pullquote');
    const viewPortHeight = document.documentElement.clientHeight;
    const pageOffset = viewPortHeight * 0.75;

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
    let embed;
    const headerContainer = document.querySelector('.article__header-bg, .article__header-bg .element > iframe');

    if (headerContainer) {
        embed = headerContainer.getElementsByClassName('element-embed')[0] || headerContainer.getElementsByClassName('element-atom')[0];
        if (embed || headerContainer.dataset.fullScreen) {
            headerContainer.style.height = `${getImageHeight()}px`;
            if (embed) {
                embed.classList.add('height-adjusted');
            }
        }
    }
}

function getImageHeight() {
    const viewPortHeight = document.documentElement.clientHeight;
    const marginTop = document.body.style.marginTop.replace('px', '');

    return viewPortHeight - marginTop;
}

function init() {
    formatImmersive();
}

export { init };