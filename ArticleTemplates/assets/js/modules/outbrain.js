function getSection () {
    const sections = ['politics', 'world', 'business', 'commentisfree'];
    const section = GU.opts.section;

    return section.toLowerCase().match('news') || sections.indexOf(section.toLowerCase()) > 0 ? 'sections' : 'all';
}

function isNonCompliant() {
    return GU.opts.hasEpic;
}

function init() {
    let contentUrl;
    const isTablet = GU.opts.adsConfig === 'tablet' ? true : false;
    const outbrainContainer = document.getElementsByClassName('container__outbrain')[0];
    const outbrainImage = document.getElementsByClassName('outbrainImage')[0];
    const outbrainText = document.getElementsByClassName('outbrainText')[0];
    const section = getSection();
    let scriptElement;
    let widgetCodeText;
    let widgetConfig;
    let widgetCodeImage;

    if (!outbrainContainer) {
        return;
    }

    contentUrl = outbrainImage.dataset.src;

    if (contentUrl) {
        outbrainContainer.style.display = 'block';

        if (isTablet) {
            if (isNonCompliant()) {
                widgetConfig = {
                    image: {
                        sections: 'AR_30',
                        all: 'AR_30'
                    },
                    text: {
                        sections: 'AR_31',
                        all: 'AR_31'
                    }
                };
            } else {
                widgetConfig = {
                    image: {
                        sections: 'AR_24',
                        all: 'AR_18'
                    },
                    text: {
                        sections: 'AR_27',
                        all: 'AR_20'
                    }
                };
            }

            outbrainText.style.display = 'block';
            widgetCodeText = widgetConfig.text[section];
            outbrainText.dataset.widgetId = widgetCodeText;
        } else {
            if (isNonCompliant()) {
                widgetConfig = {
                    image: {
                        sections: 'AR_29',
                        all: 'AR_29'
                    }
                };
            } else {
                widgetConfig = {
                    image: {
                        sections: 'AR_22',
                        all: 'AR_16'
                    }
                };
            }

            if (outbrainContainer.childElementCount > 0 && outbrainText) {
                outbrainContainer.removeChild(outbrainText);
            }
        }

        widgetCodeImage = widgetConfig.image[section];
        outbrainImage.dataset.widgetId = widgetCodeImage;

        scriptElement = document.createElement('script');
        scriptElement.id = 'outbrain-widget';
        scriptElement.async = true;
        scriptElement.src = 'https://widgets.outbrain.com/outbrain.js';

        document.body.appendChild(scriptElement);
    }
}

export { init };