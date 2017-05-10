define([
    'modules/util'
],
function (
    util
) {
    'use strict';

    var initialised;
    var trackedImpressions = [];

    function init() {
        if (!initialised) {
            initialised = true;

            window.injectCreative = injectCreative;
            window.applyNativeFunctionCall('injectInlineCreative');
        }
    }

    function trackLiveBlogEpic() {
        // if there is already a data-tracked attribute than we don't need to set up tracking again
        var liveBlogEpicContainers = document.querySelectorAll('.contributions-epic__container:not([data-tracked])');
        var liveBlogEpicContainerId;
        var i;
        var liveBlogEpicContainer;

        for (i = 0; i < liveBlogEpicContainers.length; i++) {
            liveBlogEpicContainer = liveBlogEpicContainers[i];
            liveBlogEpicContainerId = liveBlogEpicContainer.getAttribute('id');

            liveBlogEpicContainer.setAttribute('data-tracked', 'true');

            addEventListenerScroll(liveBlogEpicContainer, liveBlogEpicContainerId);
        }
    }

    function injectCreative(html, css, id, type) {
        if (util.isOnline() && !document.getElementById(id)) {
            injectCSS(css);
            injectHTML(html, id, type);
        }
    }

    function injectCSS(css) {
        var style = document.createElement('style');

        style.type = 'text/css';

        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        document.head.appendChild(style);
    }

    function addEventListenerScroll(creativeContainer, id) {
        window.addEventListener('scroll', util.debounce(isCreativeInView.bind(null, creativeContainer, id), 100));
    }

    function injectHTML(html, id, type) {
        var creativeContainer = document.createElement('div');

        creativeContainer.id = id;
        creativeContainer.classList.add('creative-container');
        creativeContainer.classList.add(type + '-creative-container');
        creativeContainer.innerHTML = html;

        if (type === 'inline-article') {
            injectInlineCreative(creativeContainer);
        } else {
            injectEpicCreative(creativeContainer);
        }

        addEventListenerScroll(creativeContainer, id);
    }

    function injectInlineCreative(creativeContainer) {
        var i,
            prose = document.querySelector('.article__body > div.prose'),
            paragraphs = prose.querySelectorAll('p:nth-child(n+4)');

        // loop through paragraphs from 4th paragraph
        // insert creativeContainer if paragraph is followed by a p or h1 elem
        for (i = 0; i < paragraphs.length; i++) {
            if (paragraphs[i].nextElementSibling &&
                (paragraphs[i].nextElementSibling.tagName === 'P' || paragraphs[i].nextElementSibling.tagName === 'H1')) {
                paragraphs[i].nextElementSibling.parentNode.insertBefore(creativeContainer, paragraphs[i].nextElementSibling);
                break;
            }
        }
    }

    function injectEpicCreative(creativeContainer) {
        var prose = document.querySelector('.article__body > div.prose');

        if (prose) {
            prose.appendChild(creativeContainer);
        }
    }

    function isCreativeInView(creativeContainer, id) {
        var messageName = 'creative_impression/' + id;

        if (trackedImpressions.indexOf(id) === -1 && util.isElementPartiallyInViewport(creativeContainer)) {
            util.signalDevice(messageName);

            trackedImpressions.push(id);
        }
    }

    return {
        init: init,
        trackLiveBlogEpic: trackLiveBlogEpic
    };
});
