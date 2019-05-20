import { getElementOffset } from 'modules/util';

let existingPosition;
let relatedContentElem;
let shouldRun = false;

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

function hasBodyMutation() {
    return window.webkit &&
        window.webkit.messageHandlers &&
        window.webkit.messageHandlers.bodyMutationNotification;
}

function relatedContentPositionUpdate() {
    if (!shouldRun) {
        return;
    }

    const newPosition = getRelatedContentPosition();

    if (newPosition &&
        (JSON.stringify(newPosition) !== JSON.stringify(existingPosition)) &&
        hasBodyMutation()
    ) {
        window.webkit.messageHandlers.bodyMutationNotification.postMessage({ rect: newPosition });
        existingPosition = newPosition;
    }
}

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

export { init, relatedContentPositionUpdate };
