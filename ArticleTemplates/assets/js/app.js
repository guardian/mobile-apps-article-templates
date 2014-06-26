/*global document,console,require */

var gu = document.getElementById('gu'),
    baseUrl = gu.getAttribute('data-js-dir');

require.config({
    paths: {
        bonzo: 'components/bonzo',
        bean: 'components/bean',
        d3: 'components/d3',
        domReady: 'components/ready',
        mobileSlider: 'components/mobile-range-slider',
        fastClick: 'components/fastclick',
        qwery: 'components/qwery',
        fence: 'components/fence',
        smoothScroll: 'components/smooth-scroll'
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
    'bootstraps/gallery',
    'bootstraps/liveblog',
    'modules/$'
], function (
    domReady,
    Common,
    Article,
    Audio,
    Football,
    Gallery,
    Liveblog,
    $
) {
    'use strict';

    domReady(function () {
        var config = {
            contentType: document.body.getAttribute('data-content-type'),
            adsEnabled: document.body.getAttribute('data-ads-enabled'),
            adsSlot: document.body.getAttribute('data-ads-slot'),
            adsConfig: document.body.getAttribute('data-ads-config'),
            adsKeywordTargeting: document.body.getAttribute('data-ads-keyword')
        };

        // Common bootstrap
        Common.init(config);

        if (config.contentType === 'article') {
            Article.init();
        }

        if (config.contentType === 'liveblog') {
            Liveblog.init();
        }

        if (config.contentType === 'audio') {
            Audio.init();
        }

        if (config.contentType === 'gallery') {
            Gallery.init();
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