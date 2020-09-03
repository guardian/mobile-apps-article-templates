const handleIframeMessage = (messageEvent) => {
    const correctType = messageEvent.data.type === 'ophan-iframe-click-event';
    const correctOrigin = messageEvent.origin === 'https://www.theguardian.com' ||
        messageEvent.origin === 'https://m.code.dev-theguardian.com/';

    if (correctOrigin && correctType) {
        const clickEvent = messageEvent.data.value;
        if (window.GuardianJSInterface && window.GuardianJSInterface.trackInPageClick) {
            window.GuardianJSInterface.trackInPageClick(JSON.stringify(clickEvent));
        }
    }
};

const init = () => {
    window.addEventListener('message', handleIframeMessage, false);
};

export {
    init
};
