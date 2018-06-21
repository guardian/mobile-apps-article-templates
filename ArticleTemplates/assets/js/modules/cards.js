define([
    'modules/util'
], 
function (
    util
) {
    'use strict';

    var initialised = false;

    function ready(config) {
        if (!initialised && GU.opts.platform === 'ios') {
            initialised = true;
            new window.MutationObserver(function(mutations) {
                // The native layer defines bodyMutationNotification.
                window.webkit.messageHandlers.bodyMutationNotification.postMessage({rect: getRelatedContentPosition() });
            }).observe(window.document.body, { attributes: true, subtree: true });
            setupGlobals();
        }
    }

    function getRelatedContentPosition() {
        var relatedContent = document.querySelector('.related-content');
        if (relatedContent) {
            return util.getElementOffset(relatedContent);
        }
        return null;
    }

    function setRelatedContentHeight(height) {
        var relatedContent = document.querySelector('.related-content')
        if (relatedContent) {
            relatedContent.style.height = height + 'px';
        }
    }

    function setupGlobals() {
        window.getRelatedContentPosition = getRelatedContentPosition;
        window.applyNativeFunctionCall("getRelatedContentPosition");
        window.setRelatedContentHeight = setRelatedContentHeight;
        window.applyNativeFunctionCall("setRelatedContentHeight");
    }

    return {
        init: ready
    };
});
