/*global document,console,require */

var gu = document.getElementById('gu'),
    baseUrl = gu.getAttribute('data-js-dir');

require.config({
    paths: {
        bonzo: '../../../node_modules/bonzo/bonzo',
        bean: '../../../node_modules/bean/bean',
        d3: '../../../node_modules/d3/d3',
        domReady: '../../../node_modules/domready/ready',
        mobileSlider: 'components/mobile-range-slider',
        fastClick: '../../../node_modules/fastclick/lib/fastclick',
        qwery: '../../../node_modules/qwery/qwery',
        fence: '../../../node_modules/fence/fence',
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
    // 'bootstraps/article',
    // 'bootstraps/liveblog',
    // 'bootstraps/audio',
    // 'bootstraps/gallery',
    // 'bootstraps/football',
    'modules/$'
], function (
    domReady,
    Common,
    // Article,
    // Liveblog,
    // Audio,
    // Gallery,
    // Football,
    $
) {
    'use strict';

    domReady(function () {

        var contentType = document.body.getAttribute('data-content-type');

        // Common bootstrap
        // Common.init(config);

        if (config.contentType === 'article') {
            require(['bootstraps/article'], function(Article){
                Article.init();
            });
        }

        if (config.contentType === 'liveblog') {
            require(['bootstraps/liveblog'], function(Liveblog){
                Liveblog.init();
            });
        }

        if (config.contentType === 'audio') {
            require(['bootstraps/audio'], function(Audio){
                Audio.init();
            });
        }

        if (config.contentType === 'gallery') {
            require(['bootstraps/gallery'], function(Gallery){
                Gallery.init();
            });
        }

        if (config.contentType === 'football') {
            require(['bootstraps/football', 'bootstrap/liveblog'], function(Football,Liveblog){
                Football.init();

                // Football liveblogs don't use the liveblog template,
                // init liveblog template JS if required
                if ($('.article__body--liveblog').length > 0) {
                    Liveblog.init();
                }
            });
        }
    });
});
