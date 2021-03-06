import {
    debounce,
    isOnline,
    signalDevice,
    isElementPartiallyInViewport
} from 'modules/util';
import { initPositionPoller } from 'modules/cards';

let impressionSeen = false;

function buttonHtml(buttonText, buttonName) {
    return `
        <div>
            <a class="epic-button" href="x-gu://creative_tap/${buttonName}">
                ${buttonText}
                <svg class="epic-button-arrow" xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="5 5 20 20">
                    <path fill="#121212" d="M22.8 14.6L15.2 7l-.7.7 5.5 6.6H6v1.5h14l-5.5 6.6.7.7 7.6-7.6v-.9"/>
                </svg>
            </a>
        </div>`;
}

function epicHtml(title, body, premiumButton, contributeButton) {
    return `
        <h1>${title}</h1>
        <div>${body}</div>
        <div class="button-container">
            ${buttonHtml(premiumButton, 'premium_button')}
            ${contributeButton ? buttonHtml(contributeButton, 'contribute_button') : ''}
        </div>
`;
}

function isCreativeInView(creativeContainer) {
    if (!impressionSeen && isElementPartiallyInViewport(creativeContainer)) {
        signalDevice('creative_impression');
        impressionSeen = true;
    }
}

function addEventListenerScroll(creativeContainer) {
    window.addEventListener('scroll', debounce(isCreativeInView.bind(null, creativeContainer), 100));
}

function injectEpicCreative(creativeContainer) {
    const prose = document.querySelector('.article__body > div.prose');

    if (prose) {
        prose.appendChild(creativeContainer);
    }
}

function injectEpic(title, body, firstButton, secondButton) {
    if (isOnline() && !document.getElementById('creative-container')) {
        const creativeContainer = document.createElement('div');
        creativeContainer.id = 'creative-container';
        creativeContainer.innerHTML = epicHtml(title, body, firstButton, secondButton);
        injectEpicCreative(creativeContainer);
        addEventListenerScroll(creativeContainer);
        initPositionPoller();
    }
}

function init() {
    window.injectEpic = injectEpic;
    window.applyNativeFunctionCall('injectEpic');
}

export { init };
