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
        smoothScroll: '../../../node_modules/smooth-scroll/dist/js/smooth-scroll',
        raven: '../../../node_modules/raven-js/dist/raven'
    },
    shim: {
        d3: {
            exports: 'd3'
        }
    }
});

require([
    'domReady',
    'modules/monitor'
], function (
    domReady,
    monitor
) {
    'use strict';

    domReady(function () {

        var contentType = document.body.getAttribute('data-content-type');
        monitor.init();

        if (contentType === 'article') {
            require(['article'], function(Article){
                Article.init();
                Raven.captureMessage('Capture message!');
                console.log(trllaalla);
            });
        } else if (contentType === 'liveblog') {
            require(['liveblog'], function(Liveblog){
                Liveblog.init();
            });
        } else if (contentType === 'audio') {
            require(['audio'], function(Audio){
                Audio.init();
            });
        } else if (contentType === 'gallery') {
            require(['gallery'], function(Gallery){
                Gallery.init();
            });
        } else if (contentType === 'football') {
            require(['football'], function(Football){
                Football.init();
            });
        } else {
            require(['bootstraps/common'], function(Common){
                Common.init();
            });
        }
    });

    function loadCss(url) {
        var basePath = document.body.getAttribute('data-template-directory');
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = basePath + url;
        document.getElementsByTagName("head")[0].appendChild(link);
    }    

    var scriptTag = document.getElementById('gu');
    var skipStyle = scriptTag.getAttribute('data-skip-style');

    if(!skipStyle){
        loadCss('assets/css/style-async.css');
    }

});
