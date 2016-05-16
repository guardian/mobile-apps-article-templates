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
            var scriptTag = document.getElementById('gu'),
                skipStyle = scriptTag.getAttribute('data-skip-style');

            module.initUtil();

            if (!skipStyle) {
                module.loadCss('assets/css/style-async.css');
            }

            domReady(module.onDomReady);
        },

        loadCss: function (url) {
            var basePath = document.body.getAttribute('data-template-directory'),
                link = document.createElement('link');

            link.type = 'text/css';
            link.rel = 'stylesheet';
            link.href = basePath + url;

            document.getElementsByTagName('head')[0].appendChild(link);
        },
            
        onDomReady: function () {
            var contentType = document.body.getAttribute('data-content-type');

            // monitoring
            monitor.init();

            // ads positioning
            Ads.init({
                adsEnabled: document.body.getAttribute('data-ads-enabled'),
                adsConfig: document.body.getAttribute('data-ads-config'),
                adsType: document.getElementsByClassName('article__body--liveblog').length ? 'liveblog' : '',
                mpuAfterParagraphs: document.body.getAttribute('data-mpu-after-paragraphs')
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