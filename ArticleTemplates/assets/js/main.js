(function () {
    
    'use strict';

    require.config({
        paths: {
            bonzo: '../../../node_modules/bonzo/bonzo',
            bean: '../../../node_modules/bean/bean',
            d3: '../../../node_modules/d3/d3',
            domReady: '../../../node_modules/domready/ready',
            mobileSlider: 'components/mobile-range-slider',
            flipSnap: 'components/flipsnap',
            fastClick: '../../../node_modules/fastclick/lib/fastclick',
            qwery: '../../../node_modules/qwery/qwery',
            fence: '../../../node_modules/fence/fence',
            smoothScroll: '../../../node_modules/smooth-scroll/dist/js/smooth-scroll',
            iscroll: 'components/iscroll'
        },
        shim: {
            iscroll: {
                exports: 'IScroll'
            },
            d3: {
                exports: 'd3'
            },
            mobileSlider: {
                exports: 'MobileRangeSlider'
            }
        }
    });

    require(['app'], function (app) {
        app.init();
    });

}());