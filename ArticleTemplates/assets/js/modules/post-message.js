define(function () {
    'use strict';

    return postMessage;

    function postMessage(message, targetWindow, targetOrigin) {
        targetWindow.postMessage(JSON.stringify(message), targetOrigin);
    }
});
