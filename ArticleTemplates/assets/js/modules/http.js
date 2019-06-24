import { signalDevice } from 'modules/util';

function GET(url, callback) {
    // callback needs to be a named function
    if (typeof callback !== "function" || callback.name === "") {
        return;
    }

    window['callbacks'][callback.name] = callback;
    signalDevice(`GET/${callback.name}/${url}`);
}

function POST(url, successCallback, errorCallback,  data) {
    // callbacks needs to be a named function
    if (typeof successCallback !== "function" ||
        typeof errorCallback !== "function" ||
        successCallback.name === "" ||
        errorCallback.name === "") {
        return;
    }

    window['callbacks'][successCallback.name] = successCallback;
    window['callbacks'][errorCallback.name] = errorCallback;

    url = encodeURIComponent(url)
    data = encodeURIComponent(data)

    signalDevice(`POST/${url}?data=${data}&successCallback=window.callbacks['${successCallback.name}']&errorCallback=window.callbacks['${errorCallback.name}']`);
}


function init() {
    window.callbacks = {};
}

export { init, GET, POST };