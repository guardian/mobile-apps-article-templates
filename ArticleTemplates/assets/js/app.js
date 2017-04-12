define([
    'domReady',
    'modules/ads',
    'modules/util'
], function(
    domReady,
    ads,
    util
) {
    'use strict';

    function init() {
        // expose util in GU namespace for interactives
        window.GU.util = util;
        domReady(onDomReady);
    }

    function initLayout(layoutObj) {
        layoutObj.init();
    }
        
    function onDomReady() {
        var contentType = GU.opts.contentType;

        // ads positioning
        ads.init({
            adsEnabled: (GU.opts.adsEnabled && GU.opts.adsEnabled === 'true') || (GU.opts.adsEnabled && GU.opts.adsEnabled.indexOf('mpu') !== -1),
            adsConfig: GU.opts.adsConfig,
            adsType: GU.opts.contentType === 'liveblog' && !GU.opts.isMinute ? 'liveblog' : 'default',
            mpuAfterParagraphs: GU.opts.mpuAfterParagraphs
        });

        // other article-specific functions
        if (contentType === 'article') {
            require(['article'], initLayout);
        } else if (contentType === 'liveblog') {
            require(['liveblog'], initLayout);
        } else if (contentType === 'audio') {
            require(['audio'], initLayout);
        } else if (contentType === 'gallery') {
            require(['gallery'], initLayout);
        } else if (contentType === 'football') {
            require(['football'], initLayout);
        } else if (contentType === 'cricket') {
            require(['cricket'], initLayout);
        } else if (contentType === 'video') {
            require(['video'], initLayout);
        } else {
            require(['bootstraps/common'], initLayout);
        }
    }

    return {
        init: init
    };
});