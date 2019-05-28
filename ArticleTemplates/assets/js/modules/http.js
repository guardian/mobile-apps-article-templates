import { signalDevice } from 'modules/util';

function GET(url, callback) {
    // callback needs to be a named function
    if (typeof callback !== "function" || callback.name === "") {
        return;
    }

    window['callbacks'][callback.name] = callback;
    signalDevice(`GET/${callback.name}/${url}`);
}

function init() {
    window.callbacks = {};
}

export { init, GET };