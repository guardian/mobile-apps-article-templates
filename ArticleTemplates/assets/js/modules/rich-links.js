function hasClass(element, className) {
    return ('' + element.className).indexOf('' + className) > -1;
}

function init() {
    let richLinks = document.getElementsByClassName('element-rich-link');

    for (var i = 0; i < richLinks.length; i++) {
        let currentLink = richLinks[i];
        let sibling = currentLink.nextElementSibling;
        if (sibling) {
            if (
                hasClass(sibling, 'element-atom') ||
                hasClass(sibling, 'element-embed') ||
                hasClass(sibling, 'element-tweet')
            ) {
                currentLink.style.width = '100%';
                sibling.style.clear = 'both';
            }
        }
    }
}

export { init };