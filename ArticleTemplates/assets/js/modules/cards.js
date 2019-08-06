import { getElementOffset } from 'modules/util';

let existingRelatedContentPosition;
let existingOutbrainPosition;
let positionPoller = null;
const maxPollInterval = 4000;
let relatedContentElem;
let outbrainElem;
let shouldRun = false;

function init() {
    relatedContentElem = document.querySelector('.related-content');
    outbrainElem = document.querySelector('.outbrain');

    if (GU.opts.platform === 'ios') {
        if (relatedContentElem || outbrainElem) {
            shouldRun = true;
        }
    } else {
        return;
    }

    setupGlobals();
    initPositionPoller();
    // on orientation change restart the position poller
    window.addEventListener('orientationchange', initPositionPoller.bind(this, 0));
}

function initPositionPoller(time = 500) {
    if (!shouldRun) {
        return;
    }

    if (positionPoller !== null) {
        window.clearTimeout(positionPoller);
    }

    poller(time);
}

function poller(interval) {
    const newRelatedContentPosition = getRelatedContentPosition();

    if (newRelatedContentPosition &&
        (JSON.stringify(newRelatedContentPosition) !== JSON.stringify(existingRelatedContentPosition)) &&
        (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.relatedContentFrameChangeMessage)
    ) {
        window.webkit.messageHandlers.relatedContentFrameChangeMessage.postMessage({rect: newRelatedContentPosition });
        existingRelatedContentPosition = newRelatedContentPosition;
    }

    const newOutbrainPosition = getOutbrainPosition();

    if (newOutbrainPosition &&
        (JSON.stringify(newOutbrainPosition) !== JSON.stringify(existingOutbrainPosition)) &&
        (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.outbrainFrameChangeMessage)
    ) {
        window.webkit.messageHandlers.outbrainFrameChangeMessage.postMessage({rect: newOutbrainPosition });
        existingOutbrainPosition = newOutbrainPosition;
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

function getOutbrainPosition() {
    if (outbrainElem) {
        return getElementOffset(outbrainElem);
    }

    return null;
}

function setRelatedContentHeight(height) {
    if (relatedContentElem) {
        relatedContentElem.style.height = `${height}px`;
    }
}

function setOutbrainHeight(height) {
    if (outbrainElem) {
        outbrainElem.style.height = `${height}px`;
    }
}

function setupGlobals() {
    window.getRelatedContentPosition = getRelatedContentPosition;
    window.applyNativeFunctionCall('getRelatedContentPosition');
    window.setRelatedContentHeight = setRelatedContentHeight;
    window.applyNativeFunctionCall('setRelatedContentHeight');
    window.getOutbrainPosition = getOutbrainPosition;
    window.applyNativeFunctionCall('getOutbrainPosition');
    window.setOutbrainHeight = setOutbrainHeight;
    window.applyNativeFunctionCall('setOutbrainHeight');
}

export { init, initPositionPoller };