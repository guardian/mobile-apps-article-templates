define([
    'modules/util'
], 
function (
    util
) {
    'use strict';

    var initialised = false;
    var existingRelatedContentPosition;
    var positionPoller = null;
    var maxPollCount = 20;
    var pollCount;

    function ready() {
        if (!initialised && GU.opts.platform === 'ios') {
            initialised = true;
            setupGlobals();
            initPositionPoller();
        }
    }

    function initPositionPoller() {
        pollCount = 0;

        if (positionPoller !== null) {
            window.clearTimeout(positionPoller);
        }

        poller(1000);
    }

    function poller(interval) {
        var newRelatedContentPosition = getRelatedContentPosition();

        if (JSON.stringify(newRelatedContentPosition) !== JSON.stringify(existingRelatedContentPosition)) {
            window.webkit.messageHandlers.bodyMutationNotification.postMessage({rect: newRelatedContentPosition });
        }

        if (pollCount < maxPollCount) {
            positionPoller = setTimeout(function() {
                poller(interval + 250);
            }, interval);
        }

        pollCount++;
    }

    function getRelatedContentPosition() {
        var relatedContent = document.querySelector('.related-content');
        if (relatedContent) {
            return util.getElementOffset(relatedContent);
        }
        return null;
    }

    function setRelatedContentHeight(height) {
        var relatedContent = document.querySelector('.related-content');

        if (relatedContent) {
            relatedContent.style.height = height + 'px';
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
