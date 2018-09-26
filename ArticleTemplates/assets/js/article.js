define([
	'bootstraps/common',
    'bootstraps/article',
    'bootstraps/atoms',
    'bootstraps/campaign'
], function (
	common,
    article,
    atoms,
    campaign
) {
    'use strict';
    
    function init() {
        common.init();
        article.init();
        atoms.init();
        campaign.init();
    }

    return {
        init: init
    };
});
