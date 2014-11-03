({
    baseUrl: "../js/",
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
    },
	// mainConfigFile: '../js/app.js',
    name: "app",
    out: "../js/app-built.js"
})