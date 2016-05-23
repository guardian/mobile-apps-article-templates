define(function() {
    'use strict';

    function init() {
        GU.util = {
            isElementInViewport: function (el) {
                var rect = el.getBoundingClientRect();

                return (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                );
            },

            isElementPartiallyInViewport: function (el) {
                var rect = el.getBoundingClientRect(),
                    windowHeight = (window.innerHeight || document.documentElement.clientHeight),
                    windowWidth = (window.innerWidth || document.documentElement.clientWidth),
                    vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0),
                    horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

                return (vertInView && horInView);
            },

            signalDevice: function (messageName) {
                var path = 'x-gu://',
                    url = path + messageName,
                    iframe = document.createElement('iframe');

                iframe.style.display = 'none';
                iframe.src = url;

                GU.util.doIframeMessage(iframe);
            },

            doIframeMessage: function (elem) {
                document.documentElement.appendChild(elem);
                document.documentElement.removeChild(elem);
            },

            isOnline: function() {
                return !document.body.classList.contains('offline') && navigator.onLine;
            },

            getClosestParentWithClass: function (elem, className) {
                while (elem && (!elem.classList || !elem.classList.contains(className))) {
                    elem = elem.parentNode;
                }

                return elem;
            },

            getClosestParentWithTag: function (elem, tagName) {
                while (elem && (elem.tagName !== tagName)) {
                    elem = elem.parentNode;
                }

                return elem;
            },

            getClosestParentWithData: function (elem, dataKey, dataVals) {
                if (typeof dataVals === 'string') {
                    dataVals = [dataVals];
                }

                while (elem && (!elem.dataset || dataVals.indexOf(elem.dataset[dataKey]) === -1)) {
                    elem = elem.parentNode;
                }

                return elem;
            },

            getStringFromUnicodeVal: function (unicodeVal) {
                return String.fromCharCode(unicodeVal);
            },

            getLocalStorage: function (key) {
                return localStorage.getItem(key);
            },

            setLocalStorage: function (key, value) {
                localStorage.setItem(key, value);
            },

            debounce: function (func, wait, immediate) {
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
            },

            merge: function (target, source) {
                var prop;

                for (prop in source) {
                    if (source.hasOwnProperty(prop)) {
                        if (target[prop] && typeof source[prop] === 'object') {
                            GU.util.merge(target[prop], source[prop]);
                        }
                        else {
                            target[prop] = source[prop];
                        }
                    }
                }

                return target;
            }
        };
    }

    var util = {
        init: init
    };

    return util;
});