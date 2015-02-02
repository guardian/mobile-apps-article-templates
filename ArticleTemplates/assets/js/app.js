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
    'domReady'
    // 'article',
    // 'liveblog',
    // 'audio',
    // 'gallery',
    // 'football'
    // 'modules/$'
], function (
    domReady
    // Article,
    // Liveblog,
    // Audio,
    // Gallery,
    // Football
    //$
) {
    'use strict';

    domReady(function () {

        var contentType = document.body.getAttribute('data-content-type');

        // Common bootstrap
        // Common.init(config);

        if (contentType === 'article') {
            require(['article'], function(Article){
                Article.init();
            });
        }

        if (contentType === 'liveblog') {
            require(['liveblog'], function(Liveblog){
                Liveblog.init();
            });
        }

        if (contentType === 'audio') {
            require(['audio'], function(Audio){
                Audio.init();
            });
        }

        if (contentType === 'gallery') {
            require(['gallery'], function(Gallery){
                Gallery.init();
            });
        }

        if (contentType === 'football') {
            require(['football'], function(Football){
                Football.init();
            });
        }
    });
});
