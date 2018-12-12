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
    const rect = el.getBoundingClientRect();
    const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
    const windowWidth = (window.innerWidth || document.documentElement.clientWidth);
    const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
    const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

    return (vertInView && horInView);
}

function getElementOffset(elem) {
    const de = elem.ownerDocument.documentElement;
    const bcr = elem.getBoundingClientRect();
    const scroll = {
        x: window.pageXOffset || document.documentElement.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop
    }
    const width = elem.offsetWidth;
    const height = elem.offsetHeight;
    const top = bcr.top + scroll.y - Math.max(0, de && de.clientTop, document.body.clientTop);
    const left = bcr.left + scroll.x - Math.max(0, de && de.clientLeft, document.body.clientLeft);

    return { top, left, height, width }
}

function signalDevice(messageName) {
    const path = 'x-gu://';
    const url = path + messageName;
    const iframe = document.createElement('iframe');

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

    while (elem && (!elem.dataset || !dataVals.includes(elem.dataset[dataKey]))) {
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
    let args;
    let callNow;
    let context;
    let later;
    let timeout;

    return function() {
        context = this;
        args = arguments;
        
        later = () => {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        }

        callNow = immediate && !timeout;
        
        clearTimeout(timeout);

        timeout = setTimeout(later, wait);

        if (callNow) {
            func.apply(context, args);
        }
    };
}

function getElemsFromHTML(html) {
    let i;
    const elems = [];
    const div = document.createElement('div');

    div.innerHTML = html;

    for (i = 0; i < div.childNodes.length; i++) {
        if (div.childNodes[i].nodeType === 1) {
            elems.push(div.childNodes[i]);
        }
    }

    return elems;
}

function append(scriptElement) {
    document.body.appendChild(scriptElement);
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
    append
};