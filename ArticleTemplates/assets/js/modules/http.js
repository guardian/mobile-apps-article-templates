import { signalDevice } from 'modules/util';

function POST(url, successCallback, errorCallback,  data) {
    // callbacks needs to be a named function
    if (typeof successCallback !== "function" ||
        typeof errorCallback !== "function" ||
        successCallback.name === "" ||
        errorCallback.name === "") {
        return;
    }

    window['httpCallbacks'][successCallback.name] = successCallback;
    window['httpCallbacks'][errorCallback.name] = errorCallback;

    url = encodeURIComponent(url)
    data = encodeURIComponent(data)

    signalDevice(`POST/${url}?data=${data}&successCallback=window.httpCallbacks['${successCallback.name}']&errorCallback=window.httpCallbacks['${errorCallback.name}']`);
}


function init() {
    window.httpCallbacks = {};
}

export { init, POST };