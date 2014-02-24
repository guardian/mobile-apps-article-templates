/*global document,console,require */

var gu = document.getElementById('gu'),
    baseUrl = gu.getAttribute('data-js-dir');

require.config({
    baseUrl: baseUrl + '/amd',
    paths: {
        bonzo: 'components/bonzo.min',
        bean: 'components/bean.min',
        d3: 'components/d3.min',
        domReady: 'components/ready.min',
        mobileSlider: 'components/mobile-range-slider',
        fastClick: 'components/fastclick',
        qwery: 'components/qwery.min',
        fence: 'components/fence'
    },
    shim: {
        d3: {
            exports: 'd3'
        }
    }
});

require([
    'domReady',
    'bootstraps/common',
    'bootstraps/article',
    'bootstraps/audio',
    'bootstraps/football',
    'bootstraps/liveblog',
    'modules/$'
], function (
    domReady,
    Common,
    Article,
    Audio,
    Football,
    Liveblog,
    $
) {
    'use strict';

    domReady(function () {
        var config = {
            contentType: document.body.getAttribute('data-content-type'),
            adsEnabled: document.body.getAttribute('data-ads-enabled'),
            adsSlot: document.body.getAttribute('data-ads-slot')
        };

        // Common bootstrap
        Common.init(config);

        // Template-specific bootstrap
        if (config.contentType === 'article') {
            Article.init();
        }

        if (config.contentType === 'liveblog') {
            Liveblog.init();
        }

        if (config.contentType === 'audio') {
            Audio.init();
        }

        if (config.contentType === 'football') {
            Football.init();

            // Football liveblogs don't use the liveblog template,
            // init liveblog template JS if required
            if ($('.article__body--liveblog').length > 0) {
                Liveblog.init();
            }
        }
    });

});