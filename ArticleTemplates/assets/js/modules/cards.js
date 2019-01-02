
import flipSnap from 'flipsnap';
import { getElementOffset } from 'modules/util';

let existingRelatedContentPosition;
let positionPoller = null;
const maxPollInterval = 4000;
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
    initPositionPoller();
    // on orientation change restart the position poller
    window.addEventListener('orientationchange', initPositionPoller);
}

function initPositionPoller() {
    if (!shouldRun) {
        return;
    }

    if (positionPoller !== null) {
        window.clearTimeout(positionPoller);
    }

    poller(500);
}

function poller(interval) {
    const newRelatedContentPosition = getRelatedContentPosition();

    if (newRelatedContentPosition &&
        (JSON.stringify(newRelatedContentPosition) !== JSON.stringify(existingRelatedContentPosition)) &&
        (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.bodyMutationNotification)
    ) {
        window.webkit.messageHandlers.bodyMutationNotification.postMessage({rect: newRelatedContentPosition });
        existingRelatedContentPosition = newRelatedContentPosition;
    }

    positionPoller = setTimeout(() => {
        const pollInterval = interval < maxPollInterval ? interval + 500 : maxPollInterval;
        poller(pollInterval);
    }, interval);
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

export { init, initPositionPoller };