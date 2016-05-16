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
            module.initUtil();

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
            
        onDomReady: function () {
            var contentType = GU.opts.contentType;

            // monitoring
            monitor.init();

            // ads positioning
            Ads.init({
                adsEnabled: GU.opts.adsEnabled,
                adsConfig: GU.opts.adsConfig,
                adsType: GU.opts.contentType ? 'liveblog' : '',
                mpuAfterParagraphs: GU.opts.mpuAfterParagraphs
            });

            // other article-specific functions
            if (contentType === 'article') {
                require(['article'], function (article) {
                    monitor.setContext('article', function () {
                        article.init();
                    });
                });
            } else if (contentType === 'liveblog') {
                require(['liveblog'], function (Liveblog) {
                    monitor.setContext('liveblog', function () {
                        Liveblog.init();
                    });
                });
            } else if (contentType === 'audio') {
                require(['audio'], function (Audio) {
                    monitor.setContext('audio', function () {
                        Audio.init();
                    });
                });
            } else if (contentType === 'gallery') {
                require(['gallery'], function (Gallery) {
                    monitor.setContext('gallery', function () {
                        Gallery.init();
                    });
                });
            } else if (contentType === 'football') {
                require(['football'], function (Football) {
                    monitor.setContext('football', function () {
                        Football.init();
                    });
                });
            } else if (contentType === 'cricket') {
                require(['cricket'], function (Cricket) {
                    monitor.setContext('cricket', function () {
                        Cricket.init();
                    });
                });
            } else {
                require(['bootstraps/common'], function (Common) {
                    monitor.setContext('common', function () {
                        Common.init();
                    });
                });
            }
        },

        initUtil: function () {
            util.init();
        }
    };

    return module;
});