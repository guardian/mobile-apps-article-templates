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

    function injectInlineCreative(html, css, id) {
        if (GU.util.isOnline() && !document.getElementById(id)) {    
            injectCSS(css);
            injectHTML(html, id);
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

    function injectHTML(html, id) {
        var prose = document.querySelector('.article__body > div.prose'),
            inlineCreativeContainer = document.createElement('div');
        
        inlineCreativeContainer.classList.add('inline-creative-container');
        inlineCreativeContainer.id = id;
        inlineCreativeContainer.innerHTML = html;

        if (prose) {
            prose.appendChild(inlineCreativeContainer);
            // on scroll check if creative is in viewport
            window.addEventListener('scroll', GU.util.debounce(isInlineCreativeInView.bind(null, inlineCreativeContainer, id), 100));
        }
    }

    function isInlineCreativeInView(inlineCreativeContainer, id) {
        var messageName = 'inline_creative_view/' + id;

        if (trackedImpressions.indexOf(id) !== -1 && GU.util.isElementPartiallyInViewport(inlineCreativeContainer)) {
            GU.util.signalDevice(messageName);
            
            trackedImpressions.push(id);
        }
    }

    return {
        init: init
    };
});