define([
    'modules/util'
], 
function (
    util
) {
    'use strict';

    var initialised = false;

    function ready(config) {
        if (!initialised) {
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
            observer.observe(relatedContent, { attributes: true });
            return util.getElementOffset(relatedContent);
        }
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
