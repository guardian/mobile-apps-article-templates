define([
    'modules/util'
], 
function (
    util
) {
    'use strict';

    var existingRelatedContentPosition;
    var positionPoller = null;
    var maxPollInterval = 4000;
    var relatedContentElem;
    var shouldRun = false;

    function ready() {
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
        var newRelatedContentPosition = getRelatedContentPosition();

        if (newRelatedContentPosition &&
            (JSON.stringify(newRelatedContentPosition) !== JSON.stringify(existingRelatedContentPosition)) &&
            (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.bodyMutationNotification)
        ) {
            window.webkit.messageHandlers.bodyMutationNotification.postMessage({rect: newRelatedContentPosition });
            existingRelatedContentPosition = newRelatedContentPosition;
        }

        positionPoller = setTimeout(function() {
            var pollInterval = interval < maxPollInterval ? interval + 500 : maxPollInterval;
            poller(pollInterval);
        }, interval);
    }

    function getRelatedContentPosition() {
        if (relatedContentElem) {
            return util.getElementOffset(relatedContentElem);
        }

        return null;
    }

    function setRelatedContentHeight(height) {
        if (relatedContentElem) {
            relatedContentElem.style.height = height + 'px';
        }
    }

    function setupGlobals() {
        window.getRelatedContentPosition = getRelatedContentPosition;
        window.applyNativeFunctionCall('getRelatedContentPosition');
        window.setRelatedContentHeight = setRelatedContentHeight;
        window.applyNativeFunctionCall('setRelatedContentHeight');
    }

    return {
        init: ready,
        initPositionPoller: initPositionPoller
    };
});
