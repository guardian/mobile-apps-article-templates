define([
    'raven'
], function (
    Raven
) {

	var config = {
		dsn: null,
		git_commit: 'not available'
	};		
	
	try {
		config = {
			dsn: GRUNT_SENTRY_DSN,
			git_commit: GRUNT_LAST_GIT_COMMIT
		};   
	} catch(e) {}

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
		},
		setContext: function(context, fn){
			if(config.dsn){
				return Raven.context({ tags: { context: context }}, fn);
			}
			return fn();
		}
	};

	var init = function(){
		var tags = modules.extractTags();
		if(!Raven.isSetup() && config.dsn){
			Raven.config(config.dsn, { 
				tags: tags,
				release: config.git_commit,
				ignoreErrors: modules.ignoreErrors(),
				shouldSendCallback: function(data) {
					if(data.stacktrace && data.stacktrace.frames){
						data.stacktrace.frames = data.stacktrace.frames.reverse().slice(0,3).reverse();
					}
					var sampleRate = 35;
					return (Math.random() * 100 <= sampleRate);
				}				
			}).install();
		}
	};

    return {
    	init: init,
    	setContext: modules.setContext,
    	modules: modules,
    	config: config,
        raven: Raven
    };
});
