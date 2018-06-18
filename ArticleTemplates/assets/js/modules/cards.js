define([
    'modules/util'
], 
function (
    util
) {
    'use strict';

    var initialised = false;
    var observer = null;

    function ready(config) {
        if (!initialised) {
            initialised = true;
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
        document.querySelector('.related-content').style.height = height + 'px';
    }

    function setupGlobals() {
        window.getRelatedContentPosition = getRelatedContentPosition;
        window.applyNativeFunctionCall("getRelatedContentPosition");
        window.setRelatedContentHeight = setRelatedContentHeight;
        window.applyNativeFunctionCall("setRelatedContentHeight");
        observer = new window.MutationObserver(function(mutations) {
            window.webkit.messageHandlers.bodyMutationNotification.postMessage({body: {} });
        });
        observer.observe(window.document.body, { attributes: true,  childList: true, subtree: true });
    }

    return {
        init: ready
    };
});
