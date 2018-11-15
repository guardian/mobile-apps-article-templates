define(function() {
    'use strict';

    function hasClass(element, className) {
        return ('' + element.className).indexOf('' + className) > -1;
    }

    function init() {
        var richLinks = document.getElementsByClassName('element-rich-link');

        for (var i = 0; i < richLinks.length; i++) {
            var currentLink = richLinks[i];
            var sibling = currentLink.nextElementSibling;
            if (sibling && hasClass(sibling, 'element-atom')) {
                currentLink.style.width = '100%';
                sibling.style.clear = 'both';
            }
        }
    }

    return {
        init: init
    };
});
