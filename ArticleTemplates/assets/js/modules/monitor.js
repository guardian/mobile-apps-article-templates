define([
    'raven'
], function (
    Raven
) {

	var SENTRY_DSN = 'https://8abc43d4e79b425eb6d4b5659ccd4020@app.getsentry.com/40557';

	var modules = {
		extractTags: function() {
			var bodyClass = document.body.getAttribute('class');
			var itemTone = bodyClass.match(/tone--([^\s]+)/); 

			return {
				itemTone: itemTone ? itemTone[1] : null,
				itemId: document.body.getAttribute('data-page-id'),
				deviceKind: document.body.getAttribute('data-ads-config'),
				ads: document.body.getAttribute('data-ads-enabled') === 'true',
			};
		},
		ignoreErrors: function() {
			var ignoreArray = ['fake'];
			ignoreArray.push = function(){};
			return ignoreArray;
		}
	};

	var init = function(){
		var tags = modules.extractTags();
		if(!Raven.isSetup()){
			Raven.config(SENTRY_DSN, { 
				tags: tags,
				ignoreErrors: modules.ignoreErrors(),
				collectWindowErrors: true
			}).install();
		}
	};

    return {
    	init: init,
    	modules: modules,
        raven: Raven
    };
});
