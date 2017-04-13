define([
    'modules/util'
], function (
    util
) {

    'use strict';

    function nativeSharing(service, url, title){
        var action;

        if (service === 'facebook') {
            action = 'facebookshare/';
        }
        
        if (service === 'twitter') {
            action = 'twittershare/';
        }

        if (action && url) {
            action = action + '?url=' + encodeURIComponent(url);

            if (title) {
                action = action + '&title=' + encodeURIComponent(title);
            }

            util.signalDevice(action);
        }
    }

    function init() {
        if (GU.opts.platform === 'ios') {
            window.nativeSharing = nativeSharing;
        }
    }

    return {
        init: init
    };
});
