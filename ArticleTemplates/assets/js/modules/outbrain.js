function isNonCompliant() {
    return GU.opts.contentType === 'liveblog';
}

function hasEpic() {
    return GU.opts.hasEpic;
}

function init() {
    let contentUrl;
    const isTablet = GU.opts.adsConfig === 'tablet' ? true : false;
    const outbrainContainer = document.getElementsByClassName('container__outbrain')[0];

    const outbrainWidget = document.getElementsByClassName('OUTBRAIN')[0];

    let scriptElement;
    let widgetConfig;

    if (!outbrainContainer) {
        return;
    }

    contentUrl = outbrainWidget.dataset.src;

    if (contentUrl) {
        outbrainContainer.style.display = 'block';

        if (isTablet) {
            widgetConfig = isNonCompliant() ? 'AR_20' : (hasEpic() ? 'AR_24' : 'AR_18');
        } else {
            widgetConfig = isNonCompliant() ? 'AR_29' : (hasEpic() ? 'AR_22' : 'AR_16');
        }

        outbrainWidget.dataset.widgetId = widgetConfig;

        scriptElement = document.createElement('script');
        scriptElement.id = 'outbrain-widget';
        scriptElement.async = true;
        scriptElement.src = 'https://widgets.outbrain.com/outbrain.js';

        document.body.appendChild(scriptElement);
    }
}

export { init };