var file, 
    tests = [];

for (file in window.__karma__.files) {
    if (window.__karma__.files.hasOwnProperty(file)) {
        if (/Test\.js$/.test(file)) {
            tests.push(file);
        }
    }
}

require.config({
    baseUrl: '/base',
    paths: {
        modules: 'ArticleTemplates/assets/js/modules',
        bonzo: 'node_modules/bonzo/bonzo',
        bean: 'node_modules/bean/bean',
        d3: 'node_modules/d3/d3',
        domReady: 'node_modules/domready/ready',
        mobileSlider: 'ArticleTemplates/assets/js/components/mobile-range-slider',
        flipSnap: 'ArticleTemplates/assets/js/components/flipsnap',
        fastClick: 'node_modules/fastclick/lib/fastclick',
        qwery: 'node_modules/qwery/qwery',
        fence: 'node_modules/fence/fence',
        smoothScroll: 'node_modules/smooth-scroll/dist/js/smooth-scroll',
        raven: 'node_modules/raven-js/dist/raven',
        lodash: 'ArticleTemplates/assets/js/components/lodash',
        // squire for stubbing modules
        squire: 'node_modules/squirejs/src/Squire'
    },
    shim: {
        d3: {
            exports: 'd3'
        },
        mobileSlider: {
            exports: 'MobileRangeSlider'
        }
    }
});

require(tests, window.__karma__.start);