import { postMessage } from 'modules/post-message';

const allowedHosts = [
    `${location.protocol}//${location.host}`,
    'http://localhost:9000',
    'https://api.nextgen.guardianapps.co.uk',
];
const listeners = {};
let registeredListeners = 0;

const error405 = { code: 405, message: 'Service %% not implemented' };
const error500 = { code: 500, message: 'Internal server error\n\n%%' };

function init(moduleInits) {
    register('syn', () => 'ack');

    moduleInits.forEach((init) => {
        init(register);
    });
}

function register(type, callback, options) {
    options || (options = {});

    if (registeredListeners === 0) {
        on(window);
    }

    /* Persistent listeners are exclusive */
    if (options.persist) {
        listeners[type] = callback;
        registeredListeners += 1;
    } else {
        listeners[type] || (listeners[type] = []);
        if (listeners[type].indexOf(callback) === -1) {
            listeners[type].push(callback);
            registeredListeners += 1;
        }
    }
}

function unregister(type, callback) {
    if (listeners[type] === undefined) {
        throw new Error(formatError(error405, type));
    }

    if (callback === undefined) {
        registeredListeners -= listeners[type].length;
        listeners[type].length = 0;
    } else if (listeners[type] === callback) {
        listeners[type] = null;
        registeredListeners -= 1;
    } else {
        const idx = listeners[type].indexOf(callback);
        if (idx > -1) {
            registeredListeners -= 1;
            listeners[type].splice(idx, 1);
        }
    }

    if (registeredListeners === 0) {
        off(window);
    }
}

function on(window) {
    window.addEventListener('message', onMessage);
}

function off(window) {
    window.removeEventListener('message', onMessage);
}

function onMessage(event) {
    // We only allow communication with selected hosts
    if (allowedHosts.indexOf(event.origin) < 0) {
        return;
    }

    const data = getData(event.data);

    if (!isValidPayload(data)) {
        return;
    }

    if (Array.isArray(listeners[data.type]) && listeners[data.type].length) {
        // Because any listener can have side-effects (by unregistering itself),
        // we run the promise chain on a copy of the `listeners` array.
        // Hat tip @piuccio
        const promise = listeners[data.type].slice()
        // We offer, but don't impose, the possibility that a listener returns
        // a value that must be sent back to the calling frame. To do this,
        // we pass the cumulated returned value as a second argument to each
        // listener. Notice we don't try some clever way to compose the result
        // value ourselves, this would only make the solution more complex.
        // That means a listener can ignore the cumulated return value and
        // return something else entirely—life is unfair.
        // We don't know what each callack will be made of, we don't want to.
        // And so we wrap each call in a promise chain, in case one drops the
        // occasional fastdom bomb in the middle.
            .reduce((promise, listener) => promise.then((ret) => {
                const iframe = getIframe(data);
                if (!iframe) {
                    throw new Error(formatError(error500, 'iframe element not found'));
                }
                const thisRet = listener(data.value, ret, iframe);
                return thisRet === undefined ? ret : thisRet;
            }), Promise.resolve(true));

        return promise.then((response) => {
            respond(null, response);
        }).catch((ex) => {
            respond(formatError(error500, ex), null);
        });
    } else if (typeof listeners[data.type] === 'function') {
        // We found a persistent listener, to which we just delegate
        // responsibility to write something. Anything. Really.
        listeners[data.type](respond, data.value, getIframe(data));
    } else {
        // If there is no routine attached to this event type, we just answer
        // with an error code
        respond(formatError(error405, data.type), null);
    }

    function respond(error, result) {
        postMessage({ id: data.id, error, result }, event.source, event.origin);
    }
}

function getData(data) {
    try {
        // Even though the postMessage API allows passing objects as-is, the
        // serialisation/deserialisation is slower than using JSON
        // Source: https://bugs.chromium.org/p/chromium/issues/detail?id=536620#c11
        return JSON.parse(data);
    } catch (ex) {
        return {};
    }
}


// Just some housekeeping to avoid malformed messages from coming through
function isValidPayload(payload) {
    return 'type' in payload &&
        'value' in payload &&
        'id' in payload &&
        'iframeId' in payload &&
        payload.type in listeners;
}

// Incoming messages contain the ID of the iframe into which the
// source window is embedded.
function getIframe(data) {
    return document.getElementById(data.iframeId);
}

// Cheap string formatting function. It accepts as its first argument
// an object `{ code, message }`. `message` is a string where successive
// occurences of %% will be replaced by the following arguments. e.g.
//
// formatError({ message: "%%, you are so %%" }, "Regis", "lovely")
//
// returns `{ message: "Regis, you are so lovely" }`. Oh, thank you!
function formatError() {
    const error = arguments[0];
    const args = Array.prototype.slice.call(arguments, 1);
    return args.reduce((e, arg) => {
        // Keep in mind that when the first argument is a string,
        // String.replace only replaces the first occurence
        e.message = e.message.replace('%%', arg);
        return e;
    }, error);
}

export {
    register,
    unregister,
    init,
};
