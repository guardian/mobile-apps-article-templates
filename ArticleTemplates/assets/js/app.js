/*global document,require,define */

define([
    'class',
    'domReady',
    'modules/monitor',
    'modules/ads',
    'helpers/util'
], function(
    Class,
    domReady,
    monitor,
    Ads,
    util
) {
    'use strict';

    var App = Class.extend({
        init: function () {
            var scriptTag = document.getElementById('gu'),
                skipStyle = scriptTag.getAttribute('data-skip-style');

            // initialise util library available as GU.util
            util.init();

            if (!skipStyle) {
                this.loadCss('assets/css/style-async.css');
            }

            domReady(this.onDomReady.bind(this));
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
            var layout,
                contentType = document.body.getAttribute('data-content-type');

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
                require(['layouts/Article'], function(Article) {
                    monitor.setContext('article', function() {
                        layout = new Article();
                    });
                });
            } else if (contentType === 'liveblog') {
                require(['liveblog'], function(Liveblog) {
                    monitor.setContext('liveblog', function() {
                        Liveblog.init();
                    });
                });
            } else if (contentType === 'audio') {
                require(['audio'], function(Audio) {
                    monitor.setContext('audio', function() {
                        Audio.init();
                    });
                });
            } else if (contentType === 'gallery') {
                require(['gallery'], function(Gallery) {
                    monitor.setContext('gallery', function() {
                        Gallery.init();
                    });
                });
            } else if (contentType === 'football') {
                require(['football'], function(Football) {
                    monitor.setContext('football', function() {
                        Football.init();
                    });
                });
            } else if (contentType === 'cricket') {
                require(['cricket'], function(Cricket) {
                    monitor.setContext('cricket', function() {
                        Cricket.init();
                    });
                });
            } else {
                require(['bootstraps/common'], function(Common) {
                    monitor.setContext('common', function() {
                        Common.init();
                    });
                });
            }
        }
    });

    return App;
});