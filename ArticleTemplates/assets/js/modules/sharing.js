import { signalDevice } from 'modules/util';

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

        signalDevice(action);
    }
}

function init() {
    if (GU.opts.platform === 'ios') {
        window.nativeSharing = nativeSharing;
    }
}

export {
    init
};