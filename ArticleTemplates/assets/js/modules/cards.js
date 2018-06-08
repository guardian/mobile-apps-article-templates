import flipSnap from 'flipsnap';
import { debounce } from 'modules/util';

function init() {
    window.articleCardsInserter = articleCardsInserter;
    window.articleCardsFailed = articleCardsFailed;

    window.applyNativeFunctionCall('articleCardsInserter');
    window.applyNativeFunctionCall('articleCardsFailed');
}

function articleCardsInserter(html) {
    const relatedContentWrapper = document.getElementsByClassName('related-content__wrapper')[0];

    if (relatedContentWrapper) {
        if (!html) {
            articleCardsFailed();
        } else {
            relatedContentWrapper.innerHTML = html;
            snapToGrid();
        }
    }
}

function articleCardsFailed() {
    const relatedContent = document.getElementsByClassName('related-content')[0];

    if (relatedContent) {
        relatedContent.classList.add('related-content--has-failed');
    }
}

function snapToGrid() {
    const relatedContentList = document.getElementsByClassName('related-content__list')[0];

    if (relatedContentList) {
        setUpFlipSnap(relatedContentList);
        window.addEventListener('resize', debounce(onResize.bind(null, relatedContentList), 100));
    }
}

function onResize(relatedContentList) {
    if (relatedContentList) {
        flipSnap.destroy();
        relatedContentList.removeAttribute('style');
        setUpFlipSnap(relatedContentList);
    }
}

function setUpFlipSnap(relatedContentList) {
    let container = relatedContentList.parentNode,
        containerStyle = container.currentStyle || window.getComputedStyle(container),
        containerWidth = container.offsetWidth - parseInt(containerStyle.paddingRight.replace('px', ''), 10) - parseInt(containerStyle.paddingLeft.replace('px', ''), 10);

    // add a class with the number of child items, so we can set the widths based on that
    relatedContentList.classList.add(`related-content__list--items-${relatedContentList.childElementCount}`);

    if (relatedContentList.scrollWidth > containerWidth) {
        flipSnap(relatedContentList);

        // Android needs to be notified of touch start / touch end so article navigation can be disabled / enabled
        if (GU.opts.platform === 'android') {
            relatedContentList.addEventListener('touchstart', onTouchStart);
            relatedContentList.addEventListener('touchend', onTouchEnd);
        }
    }
}

function onTouchStart() {
    window.GuardianJSInterface.registerRelatedCardsTouch(true);
}

function onTouchEnd() {
    window.GuardianJSInterface.registerRelatedCardsTouch(false);
}

export { init };
