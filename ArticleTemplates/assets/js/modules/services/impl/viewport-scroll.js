var listening = false;
var elements = Object.create(null);
var elementCount = 0;

function observe(element, threshold, callback) {
    if (!listening) {
        window.addEventListener('scroll', onScroll);
        listening = true;
    }

    if (!elements[threshold]) {
        elements[threshold] = [];
    }

    elements[threshold].push({ element, callback });
    elementCount += 1;
}

function unobserve(element, threshold, callback) {
    if (!elements[threshold]) return;

    var lengthBefore = elements[threshold].length;
    elements[threshold] = elements[threshold].filter((record) => record.element !== element && record.callback !== callback);

    elementCount -= lengthBefore - elements.length;

    if (elementCount === 0) {
        window.removeEventListener('scroll', onScroll);
        listening = false;
    }
}

function onScroll() {
    var viewportHeight = window.innerHeight;

    Object.keys(elements).forEach((threshold) => {
        elements[threshold].forEach((record) => {
            var rect = record.element.getBoundingClientRect();
            var isNotHidden =
            rect.top + rect.left + rect.right + rect.bottom !== 0;
            var area = (rect.bottom - rect.top) * (rect.right - rect.left);
            var visibleArea = rect.bottom <= 0
                ? 0
                : rect.top >= viewportHeight
                    ? 0
                    : (Math.min(viewportHeight, rect.bottom) - Math.max(0, rect.top)) * (rect.right - rect.left);
            var intersectionRatio = visibleArea / area;
            if (isNotHidden && intersectionRatio >= threshold) {
                setTimeout(record.callback, 0, visibleArea);
            }
        });
    });
}

export default {
    observe,
    unobserve,
};
