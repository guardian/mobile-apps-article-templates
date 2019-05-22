import { getElementOffset } from 'modules/util';

let existingRelatedContentPosition;
let relatedContentElem;
let shouldRun = false;

function init() {
    relatedContentElem = document.querySelector('.related-content');

    if (relatedContentElem && GU.opts.platform === 'ios') {
        shouldRun = true;
    } else {
        return;
    }

    setupGlobals();
    window.addEventListener('orientationchange', relatedContentPositionUpdate);
}

function relatedContentPositionUpdate() {
    if (!shouldRun) {
        return;
    }

    const newRelatedContentPosition = getRelatedContentPosition();

    if (newRelatedContentPosition &&
        (JSON.stringify(newRelatedContentPosition) !== JSON.stringify(existingRelatedContentPosition)) &&
        (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.bodyMutationNotification)
    ) {
        window.webkit.messageHandlers.bodyMutationNotification.postMessage({rect: newRelatedContentPosition });
        existingRelatedContentPosition = newRelatedContentPosition;
    }
}

function getRelatedContentPosition() {
    if (relatedContentElem) {
        return getElementOffset(relatedContentElem);
    }

    return null;
}

function setRelatedContentHeight(height) {
    if (relatedContentElem) {
        relatedContentElem.style.height = `${height}px`;
    }
}

function setupGlobals() {
    window.getRelatedContentPosition = getRelatedContentPosition;
    window.applyNativeFunctionCall('getRelatedContentPosition');
    window.setRelatedContentHeight = setRelatedContentHeight;
    window.applyNativeFunctionCall('setRelatedContentHeight');
}

export { init, relatedContentPositionUpdate };