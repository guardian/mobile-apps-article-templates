define([
    'modules/youtube'
], function (
    youtube
) {
    'use strict';

    var initialised;

    function ready() {
        if (!initialised) {
            initialised = true;

            youtube.init();
        }
    }

    return {
        init: ready
    };
});
