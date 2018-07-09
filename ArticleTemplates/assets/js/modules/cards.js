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
    var maxPollInterval = 4000;

    function ready() {
        if (!initialised && GU.opts.platform === 'ios') {
            initialised = true;
            setupGlobals();
            initPositionPoller();
        }
    }

    function initPositionPoller() {
        if (positionPoller !== null) {
            window.clearTimeout(positionPoller);
        }

        poller(500);
    }

    function poller(interval) {
        var newRelatedContentPosition = getRelatedContentPosition();

        if (newRelatedContentPosition &&
            (JSON.stringify(newRelatedContentPosition) !== JSON.stringify(existingRelatedContentPosition))
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
