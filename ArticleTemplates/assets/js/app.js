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

    var module = {
        init: function () {
            util.init();

            if (!GU.opts.skipStyle) {
                module.loadCss();
            }

            domReady(module.onDomReady);
        },

        loadCss: function () {
            var url = 'assets/css/style-async.css',
                basePath = GU.opts.templatesDirectory,
                link = document.createElement('link');

            link.type = 'text/css';
            link.rel = 'stylesheet';
            link.href = basePath + url;

            document.getElementsByTagName('head')[0].appendChild(link);
        },

        initLayout: function (layoutName, layoutObj) {
            monitor.setContext(layoutName, layoutObj.init);
        },
            
        onDomReady: function () {
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

            // // other article-specific functions
            if (contentType === 'article') {
                require(['article'], module.initLayout.bind(null, 'article'));
            } else if (contentType === 'liveblog') {
                require(['liveblog'], module.initLayout.bind(null, 'liveblog'));
            } else if (contentType === 'audio') {
                require(['audio'], module.initLayout.bind(null, 'audio'));
            } else if (contentType === 'gallery') {
                require(['gallery'], module.initLayout.bind(null, 'gallery'));
            } else if (contentType === 'football') {
                require(['football'], module.initLayout.bind(null, 'football'));
            } else if (contentType === 'cricket') {
                require(['cricket'], module.initLayout.bind(null, 'cricket'));
            } else {
                require(['bootstraps/common'], module.initLayout.bind(null, 'common'));
            }
        }
    };

    return module;
});