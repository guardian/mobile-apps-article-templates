import {
    signalDevice
} from '../modules/util';

function init() {
    window.listenToArticleSetup = listenToArticleSetup;
    const placeholder = document.createElement('div');
    const listenToArticleSibling = document.querySelector('.standfirst');

    if (!(listenToArticleSibling && listenToArticleSibling.parentNode)) {
        // Not enough paragraphs on page to add adFree taster
        return;
    }

    const node = document.createElement('div');
    node.textContent = 'my div';
    // node.className = 'transparent-box';

    placeholder.appendChild(node);
    placeholder.classList.add('transparent-box');
    listenToArticleSibling.parentNode.insertBefore(placeholder, listenToArticleSibling.nextSibling);
    // signalDevice('listenToArticle/listenToArticleSeen');

    // setupButton();
}

function listenToArticleSetup() {

}

// function isListenToArticleInView(listenToArticle) {
//     if (isElementPartiallyInViewport(listenToArticle)) {
//     }
// }

// function setupButton() {
//     const adFreeTasterContainer = document.querySelector('.js-ad-free-taster');
//     const button = adFreeTasterContainer.querySelector('button');
//     button.addEventListener('click', () => {
//         signalDevice('premiumTaster/adFreePremiumTasterDismissed');
//         adFreeTasterContainer.remove()
//     })
// }

export { init };
