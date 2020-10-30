import {
    debounce,
    signalDevice,
    isElementPartiallyInViewport,
} from 'modules/util';

function init() {
    try {
        const showAdFreeTaster = window.GU.opts.showAdFreeTaster;
        if (!showAdFreeTaster) {
            return;
        }

        const afterParagraphs = 3;
        const placeholder = document.createElement('div');
        const adFreeTasterSibling = document.querySelector(`.article__body > div.prose > p:nth-of-type(${afterParagraphs - 1}) ~ p + p`);

        if (!(adFreeTasterSibling && adFreeTasterSibling.parentNode)) {
            // Not enough paragraphs on page to add adFree taster
            return;
        }
        
        placeholder.classList.add('ad-free-taster');
        adFreeTasterSibling.parentNode.insertBefore(placeholder, adFreeTasterSibling);
        window.addEventListener('scroll', debounce(isAdFreePremiumTasterInView.bind(null, placeholder), 200));
    } catch (e) {
        console.error(e);
    }
}

function isAdFreePremiumTasterInView(AdFreePremiumTaster) {
    if (isElementPartiallyInViewport(AdFreePremiumTaster)) {
        console.log("taster in viewport, report to native layers");
        signalDevice('trackAction/AdFreePremiumTaster:seen');
    }
}

export { init };
