define(function () {
    'use strict';

    var initialised;
    var trackedImpressions = [];

    function init() {
        if (!initialised) {
            initialised = true;

            window.injectInlineCreative = injectInlineCreative;
            window.applyNativeFunctionCall('injectInlineCreative');
        }
    }

    function injectInlineCreative(html, css, id, type) {
        if (GU.util.isOnline() && !document.getElementById(id)) {   
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

    function injectHTML(html, id, type) {
        var creativeContainer = document.createElement('div');
        
        creativeContainer.classList.add(type + '-creative-container');
        creativeContainer.id = id;
        creativeContainer.innerHTML = html;

        if (type === 'inline-article') {
            injectInlineCreative(creativeContainer);
        } else {
            injectEpicCreative(creativeContainer);
        }
    }

    function injectInlineCreative(creativeContainer) {
        var i,
            prose = document.querySelector('.article__body > div.prose'),
            paragraphs = prose.querySelectorAll('p');

        if (paragraphs.length < 4) {
            return;
        }

        // loop through paragraphs after 3rd paragraph 
        // insert creativeContainer after any paragraph which is followed by a paragraph or header
        for (i = 3; i < paragraphs.length; i++) {
            if (paragraphs[i].nextSibling && 
                (paragraphs[i].nextSibling.tagName === 'P' || paragraphs[i].nextSibling.tagName === 'H1')) {
                paragraphs[i].nextSibling.parentNode.insertBeforeElem(creativeContainer, paragraphs[i].nextSibling);
                break;
            }
        }
    }

    function injectEpicCreative(creativeContainer) {
        var prose = document.querySelector('.article__body > div.prose');
            
        if (prose) {
            prose.appendChild(creativeContainer);
            window.addEventListener('scroll', GU.util.debounce(isInlineCreativeInView.bind(null, creativeContainer, id), 100));
        }
    }

    function isInlineCreativeInView(creativeContainer, id) {
        var messageName = 'inline_creative_view/' + id;

        if (trackedImpressions.indexOf(id) === -1 && GU.util.isElementPartiallyInViewport(creativeContainer)) {
            GU.util.signalDevice(messageName);
            
            trackedImpressions.push(id);
        }
    }

    return {
        init: init
    };
});