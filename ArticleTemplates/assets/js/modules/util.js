function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function isElementPartiallyInViewport(el) {
    let rect = el.getBoundingClientRect(),
        windowHeight = (window.innerHeight || document.documentElement.clientHeight),
        windowWidth = (window.innerWidth || document.documentElement.clientWidth),
        vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0),
        horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

    return (vertInView && horInView);
}

function getElementOffset(elem) {
    let de = elem.ownerDocument.documentElement,
        bcr = elem.getBoundingClientRect(),
        scroll = {
            x: window.pageXOffset || document.documentElement.scrollLeft,
            y: window.pageYOffset || document.documentElement.scrollTop,
        },
        width = elem.offsetWidth,
        height = elem.offsetHeight,
        top = bcr.top + scroll.y - Math.max(0, de && de.clientTop, document.body.clientTop),
        left = bcr.left + scroll.x - Math.max(0, de && de.clientLeft, document.body.clientLeft);

    return {
        top,
        left,
        height,
        width,
    };
}

function signalDevice(messageName) {
    let path = 'x-gu://',
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
    let callNow;
    let context;
    let later;
    let timeout;

    return function (...args) {
        context = this;

        later = function () {
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
    let i,
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

export {
    isElementInViewport,
    isElementPartiallyInViewport,
    getElementOffset,
    signalDevice,
    isOnline,
    getClosestParentWithClass,
    getClosestParentWithTag,
    getClosestParentWithData,
    getStringFromUnicodeVal,
    getLocalStorage,
    setLocalStorage,
    debounce,
    getElemsFromHTML,
};
