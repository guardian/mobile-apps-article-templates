define(function () {
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

    function injectCreative(html, css, id, type) {
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
        
        creativeContainer.id = id;
        creativeContainer.classList.add('creative-container');
        creativeContainer.classList.add(type + '-creative-container');
        creativeContainer.innerHTML = html;

        if (type === 'inline-article') {
            injectInlineCreative(creativeContainer);
        } else {
            injectEpicCreative(creativeContainer);
        }

        window.addEventListener('scroll', GU.util.debounce(isCreativeInView.bind(null, creativeContainer, id), 100));
    }

    function injectInlineCreative(creativeContainer) {
        var i,
            prose = document.querySelector('.article__body > div.prose'),
            paragraphs = prose.querySelectorAll('p:nth-child(n+4)');

        // loop through paragraphs from 4th paragraph
        // insert creativeContainer if paragraph which is followed by a p or h1 elem
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

        if (trackedImpressions.indexOf(id) === -1 && GU.util.isElementPartiallyInViewport(creativeContainer)) {
            GU.util.signalDevice(messageName);
            
            trackedImpressions.push(id);
        }
    }

    return {
        init: init
    };
});