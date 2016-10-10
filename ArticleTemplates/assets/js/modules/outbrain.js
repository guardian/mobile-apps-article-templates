/*
 Module: outbrain.js
 Description: show promoted content by outbrain.
 */
define(function () {
    'use strict';

    function getSection () {
        var sections = ['politics', 'world', 'business', 'commentisfree'],
            section = GU.opts.section;
        
        return section.toLowerCase().match('news') || sections.indexOf(section.toLowerCase()) > 0 ? 'sections' : 'all';
    }

    function ready() {
        var contentUrl,
            isTablet = GU.opts.adsConfig === 'tablet' ? true : false,
            outbrainContainer = document.getElementsByClassName('container__outbrain')[0],
            outbrainImage = document.getElementsByClassName('outbrainImage')[0],
            outbrainText = document.getElementsByClassName('outbrainText')[0],
            section = getSection(),
            scriptElement,
            widgetCodeText,
            widgetConfig,
            widgetCodeImage;

        if (!outbrainContainer) {
            return;
        }

        contentUrl = outbrainImage.dataset.src;

        if (contentUrl) {
            outbrainContainer.style.display = 'block';

            if (isTablet) {
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
                outbrainText.style.display = 'block';
                widgetCodeText = widgetConfig.text[section];
                outbrainText.dataset.widgetId = widgetCodeText;
            } else {
                widgetConfig = {
                    image: {
                        sections: 'AR_22',
                        all: 'AR_16'
                    }
                };
                if (outbrainContainer.childElementCount > 0 && outbrainText) {
                    outbrainContainer.removeChild(outbrainText);
                }
            }

            widgetCodeImage = widgetConfig.image[section];
            outbrainImage.dataset.widgetId = widgetCodeImage;

            scriptElement = document.createElement('script');
            scriptElement.id = 'outbrain-widget';
            scriptElement.async = true;
            scriptElement.src = 'https://widgets.outbrain.com/outbrain.js?cachebuster=123456789';

            document.body.appendChild(scriptElement);
        }
    }

    return {
        init: ready
    };
});