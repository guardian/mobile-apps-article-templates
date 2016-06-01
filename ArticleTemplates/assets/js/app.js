define([
    'domReady',
    'modules/monitor',
    'modules/ads',
    'modules/util'
], function(
    domReady,
    monitor,
    Ads,
    util
) {
    'use strict';

    function init() {
        util.init();

        if (!GU.opts.skipStyle) {
            loadCss();
        }

        domReady(onDomReady);
    }

    function loadCss() {
        var url = 'assets/css/style-async.css',
            basePath = GU.opts.templatesDirectory,
            link = document.createElement('link');

        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = basePath + url;

        document.getElementsByTagName('head')[0].appendChild(link);
    }

    function initLayout(layoutName, layoutObj) {
        monitor.setContext(layoutName, layoutObj.init);
    }
        
    function onDomReady() {
        var contentType = GU.opts.contentType;

        // monitoring
        monitor.init();

        // ads positioning
        Ads.init({
            adsEnabled: GU.opts.adsEnabled,
            adsConfig: GU.opts.adsConfig,
            adsType: GU.opts.contentType === 'liveblog' ? 'liveblog' : '',
            mpuAfterParagraphs: GU.opts.mpuAfterParagraphs
        });

        // other article-specific functions
        if (contentType === 'article') {
            require(['article'], initLayout.bind(null, 'article'));
        } else if (contentType === 'liveblog') {
            require(['liveblog'], initLayout.bind(null, 'liveblog'));
        } else if (contentType === 'audio') {
            require(['audio'], initLayout.bind(null, 'audio'));
        } else if (contentType === 'gallery') {
            require(['gallery'], initLayout.bind(null, 'gallery'));
        } else if (contentType === 'football') {
            require(['football'], initLayout.bind(null, 'football'));
        } else if (contentType === 'cricket') {
            require(['cricket'], initLayout.bind(null, 'cricket'));
        } else {
            require(['bootstraps/common'], initLayout.bind(null, 'common'));
        }
    }

    return {
        init: init
    };
});