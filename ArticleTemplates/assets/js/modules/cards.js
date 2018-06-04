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
            setupGlobals();
        }
    }

    function getRelatedContentPosition() {
        var relatedContent = document.querySelector('.related-content');
        if (relatedContent) {
            return util.getElementOffset(relatedContent);
        }
    }

    function setupGlobals() {
        window.getRelatedContentPosition = getRelatedContentPosition;
        window.applyNativeFunctionCall("getRelatedContentPosition");
    }

    return {
        init: ready
    };
});
