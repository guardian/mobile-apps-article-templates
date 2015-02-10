/*global document,console,require */

var gu = document.getElementById('gu'),
    baseUrl = gu.getAttribute('data-js-dir');

require.config({
    paths: {
        bonzo: '../../../node_modules/bonzo/bonzo',
        bean: '../../../node_modules/bean/bean',
        d3: '../../../node_modules/d3/d3',
        domReady: '../../../node_modules/domready/ready',
        mobileSlider: '../../../bower_components/mobile-range-slider/mobile-range-slider',
        fastClick: '../../../node_modules/fastclick/lib/fastclick',
        qwery: '../../../node_modules/qwery/qwery',
        fence: '../../../node_modules/fence/lib/fence',
        smoothScroll: '../../../node_modules/smooth-scroll/dist/js/smooth-scroll'
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
            adsConfig: document.body.getAttribute('data-ads-config')
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