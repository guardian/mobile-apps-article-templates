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
        throttleDebounce: 'components/throttle-debounce',
        flipSnap: 'components/flipsnap',
        fastClick: '../../../node_modules/fastclick/lib/fastclick',
        qwery: '../../../node_modules/qwery/qwery',
        fence: '../../../node_modules/fence/fence',
        smoothScroll: '../../../node_modules/smooth-scroll/dist/js/smooth-scroll',
        raven: '../../../node_modules/raven-js/dist/raven',
        iscroll: 'components/iscroll'
    },
    shim: {
        d3: {
            exports: 'd3'
        }
    }
});

require([
    'domReady',
    'modules/monitor',
    'modules/ads'
], function (
    domReady,
    monitor,
    Ads
) {
    'use strict';

    domReady(function () {

        var contentType = document.body.getAttribute('data-content-type');

        // monitoring
        monitor.init();

        // ads positioning
        Ads.init({
            adsEnabled: document.body.getAttribute('data-ads-enabled'),
            adsConfig: document.body.getAttribute('data-ads-config'),
            mpuAfterParagraphs: document.body.getAttribute('data-mpu-after-paragraphs'),
            contentType: contentType
        });

        // other article-specific functions
        if (contentType === 'article') {
            require(['article'], function(Article){
                monitor.setContext('article', function(){
                    Article.init();
                });
            });
        } else if (contentType === 'liveblog') {
            require(['liveblog'], function(Liveblog){
                monitor.setContext('liveblog', function(){
                    Liveblog.init();
                });
            });
        } else if (contentType === 'audio') {
            require(['audio'], function(Audio){
                monitor.setContext('audio', function(){
                    Audio.init();
                });
            });
        } else if (contentType === 'gallery') {
            require(['gallery'], function(Gallery){
                monitor.setContext('gallery', function(){
                    Gallery.init();
                });
            });
        } else if (contentType === 'football') {
            require(['football'], function(Football){
                monitor.setContext('football', function(){
                    Football.init();
                });
            });
        } else if(contentType === 'cricket') {
            require(['cricket'], function(Cricket){
                monitor.setContext('cricket', function(){
                    Cricket.init();
                });
            });
        } else {
            require(['bootstraps/common'], function(Common){
                monitor.setContext('common', function(){
                    Common.init();
                });
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

    // async styles 
    var scriptTag = document.getElementById('gu');
    var skipStyle = scriptTag.getAttribute('data-skip-style');

    if (!skipStyle) {
        loadCss('assets/css/style-async.css');
    }
});
