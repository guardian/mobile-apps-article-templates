define(function() {
    'use strict';

    function isElementInViewport(el) {
        var rect = el.getBoundingClientRect();

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    function isElementPartiallyInViewport(el) {
        var rect = el.getBoundingClientRect(),
            windowHeight = (window.innerHeight || document.documentElement.clientHeight),
            windowWidth = (window.innerWidth || document.documentElement.clientWidth),
            vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0),
            horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

        return (vertInView && horInView);
    }

    function getElementOffset(elem) {
        var de = elem.ownerDocument.documentElement,
            bcr = elem.getBoundingClientRect(),
            scroll = {
                x: window.pageXOffset || document.documentElement.scrollLeft, 
                y: window.pageYOffset || document.documentElement.scrollTop
            },
            width = elem.offsetWidth,
            height = elem.offsetHeight,
            top = bcr.top + scroll.y - Math.max(0, de && de.clientTop, document.body.clientTop),
            left = bcr.left + scroll.x - Math.max(0, de && de.clientLeft, document.body.clientLeft);

        return {
            top: top,
            left: left,
            height: height,
            width: width
        };
    }

    function signalDevice(messageName) {
        var path = 'x-gu://',
            url = path + messageName,
            iframe = document.createElement('iframe');

        iframe.style.display = 'none';
        iframe.src = url;

        document.documentElement.appendChild(iframe);
        document.documentElement.removeChild(iframe);
    }

    function isOnline() {
        return !GU.opts.isOffline && navigator.onLine;
    }

    function getClosestParentWithClass(elem, className) {
        while (elem && (!elem.classList || !elem.classList.contains(className))) {
            elem = elem.parentNode;
        }

        return elem;
    }

    function getClosestParentWithTag(elem, tagName) {
        while (elem && (elem.tagName !== tagName.toUpperCase())) {
            elem = elem.parentNode;
        }

        return elem;
    }

    function getClosestParentWithData(elem, dataKey, dataVals) {
        if (typeof dataVals === 'string') {
            dataVals = [dataVals];
        }

        while (elem && (!elem.dataset || dataVals.indexOf(elem.dataset[dataKey]) === -1)) {
            elem = elem.parentNode;
        }

        return elem;
    }

    function getStringFromUnicodeVal(unicodeVal) {
        return String.fromCharCode(unicodeVal);
    }

    function getLocalStorage(key) {
        return localStorage.getItem(key);
    }

    function setLocalStorage(key, value) {
        localStorage.setItem(key, value);
    }

    function debounce(func, wait, immediate) {
        var args;
        var callNow;
        var context;
        var later;
        var timeout;
        
        return function() {
            context = this;
            args = arguments;
            
            later = function() {
                timeout = null;
                if (!immediate) {
                    func.apply(context, args);
                }
            };

            callNow = immediate && !timeout;
            
            clearTimeout(timeout);
            
            timeout = setTimeout(later, wait);
            
            if (callNow) {
                func.apply(context, args);
            }
        };
    }

    function getElemsFromHTML(html) {
        var i,
            elems = [],
            div = document.createElement('div');
        
        div.innerHTML = html;

        for (i = 0; i < div.childNodes.length; i++) {
            if (div.childNodes[i].nodeType === 1) {
                elems.push(div.childNodes[i]);
            }
        }
        
        return elems;
    }

    return {
        isElementInViewport: isElementInViewport,
        isElementPartiallyInViewport: isElementPartiallyInViewport,
        getElementOffset: getElementOffset,
        signalDevice: signalDevice,
        isOnline: isOnline,
        getClosestParentWithClass: getClosestParentWithClass,
        getClosestParentWithTag: getClosestParentWithTag,
        getClosestParentWithData: getClosestParentWithData,
        getStringFromUnicodeVal: getStringFromUnicodeVal,
        getLocalStorage: getLocalStorage,
        setLocalStorage: setLocalStorage,
        debounce: debounce,
        getElemsFromHTML: getElemsFromHTML
    };
});