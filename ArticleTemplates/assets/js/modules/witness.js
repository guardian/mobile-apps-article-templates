define(function () {
    'use strict';

    function init() {
        var witness = document.getElementsByClassName('witness')[0];

        if (witness) {
            document.getElementsByClassName('article__body')[0].insertAdjacentHTML('afterend', '<div class="extras">' + witness.outerHTML + '</div>');
        }
    }

    return {
        init: init
    };
});