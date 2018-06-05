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

    function setRelatedItemsHeight(height) {
        document.querySelector('.related-content').style.height = height + 'px';
    }

    function setupGlobals() {
        window.getRelatedContentPosition = getRelatedContentPosition;
        window.applyNativeFunctionCall("getRelatedContentPosition");
        window.setRelatedItemsHeight = setRelatedItemsHeight;
        window.applyNativeFunctionCall("setRelatedItemsHeight");
    }

    return {
        init: ready
    };
});
