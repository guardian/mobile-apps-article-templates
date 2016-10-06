/*global window,define */
define([
        'flipSnap'
    ],
    function (
        flipSnap
    ) {
    'use strict';

    var initialised = false;

    function setupGlobals() {
        window.articleCardsInserter = articleCardsInserter;
        window.articleCardsFailed = articleCardsFailed;

        window.applyNativeFunctionCall('articleCardsInserter');
        window.applyNativeFunctionCall('articleCardsFailed');
    }

    function articleCardsInserter(html) {
        var relatedContentWrapper = document.getElementsByClassName('related-content__wrapper')[0];

        if (relatedContentWrapper) {
            if (!html) {
                articleCardsFailed();
            } else {
                relatedContentWrapper.innerHTML = html;
                snapToGrid();
            }
        }
    }

    function articleCardsFailed() {
        var relatedContent = document.getElementsByClassName('related-content')[0];

        if (relatedContent) {
            relatedContent.classList.add('related-content--has-failed');       
        }
    }

    function snapToGrid() {
        var relatedContentList = document.getElementsByClassName('related-content__list')[0];

        if (relatedContentList) {
            setUpFlipSnap(relatedContentList);
            window.addEventListener('resize', GU.util.debounce(onResize.bind(null, relatedContentList), 100));
        }
    }

    function onResize(relatedContentList) {
        if (flipSnap && flipSnap.destroy && relatedContentList) {
            flipSnap.destroy();
            relatedContentList.removeAttribute('style');
            setUpFlipSnap(relatedContentList);
        }
    }

    function setUpFlipSnap(relatedContentList) {
        var container = relatedContentList.parentNode,
            containerStyle = container.currentStyle || window.getComputedStyle(container),
            containerWidth = container.offsetWidth - parseInt(containerStyle.paddingRight.replace('px','')) - parseInt(containerStyle.paddingLeft.replace('px',''));

        // add a class with the number of child items, so we can set the widths based on that 
        relatedContentList.classList.add('related-content__list--items-' + relatedContentList.childElementCount);

        if (relatedContentList.scrollWidth > containerWidth) {
            flipSnap = flipSnap(relatedContentList);

            // Android needs to be notified of touch start / touch end so article navigation can be disabled / enabled
            if (document.body.classList.contains('android')) {
                relatedContentList.addEventListener('touchstart', onTouchStart);
                relatedContentList.addEventListener('touchend', onTouchEnd);
            }
        }            
    }

    function onTouchStart() {
        window.GuardianJSInterface.registerRelatedCardsTouch(true);
    }

    function onTouchEnd() {
        window.GuardianJSInterface.registerRelatedCardsTouch(false);   
    }

    function ready() {
        if (!initialised) {
            initialised = true;
            setupGlobals();
        }
    }

    return {
        init: ready
    };
});