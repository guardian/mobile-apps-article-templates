require.config({
    baseUrl: '/root/ArticleTemplates/assets/js',
    paths: {

        // -- components
        bonzo: 'components/bonzo',
        bean: 'components/bean',
        d3: 'components/d3',
        domReady: 'components/ready',
        mobileSlider: 'components/mobile-range-slider',
        fastClick: 'components/fastclick',
        qwery: 'components/qwery',
        fence: 'components/fence',
        smoothScroll: 'components/smooth-scroll',

        // -- tests
        test_common: '/root/test/unit/common'
    },
    shim: {
        d3: {
            exports: 'd3'
        }
    }
});

require(['test_common'], function(test){
    mocha.run();
});