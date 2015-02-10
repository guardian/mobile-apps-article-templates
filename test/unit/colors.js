define([
	'bonzo',
	'modules/$'
], function( bonzo, $){


	function checkColors(done, opts){
		var iframe = bonzo(bonzo.create('<iframe id="iframe" src="' + opts.url + '"></iframe>'));
		iframe.appendTo(sandbox);
		var loaded = setInterval(function(){
			if(iframe[0].contentWindow.window.baseUrl){
				clearInterval(loaded);
				var document = iframe[0].contentWindow.document;

				if(opts.bg){
					var bg = $('.article__header', document).css('background-color');
					expect(bg).to.match(opts.bg);
				}

				if(opts.type){
					var type = $('.article__header .headline', document).css('color');
					expect(type).to.match(opts.type);
				}

				if(opts.status){
					var status = $('.article__header .meta', document).css('background-color');
					expect(status).to.match(opts.status);
				}

				if(opts.divider){
					var divider = window.getComputedStyle($('.article', document)[0]).getPropertyValue('border-top-color');
					expect(divider).to.match(opts.divider);
				}

				done();
			}
		}, 100);
	};

	describe('Colors', function(){
		var sandbox;

		before(function(){
			sandbox = bonzo(bonzo.create('<div id="sandbox" style="visibility:hidden;"></div>'));
			sandbox.appendTo(document.body);
		});

		// this test at the moment break phantomJS but works on chrome (http://localhost:3000/root/test/unit/runner.html)
		if (navigator.userAgent.indexOf('PhantomJS') < 0) {
			it('has the right colors for the review', function(done){
				checkColors(done, {
					url: '/tone-review.html',
					bg: /rgb\(97, 91, 82\)|#615b52/i,
					type: /rgb\(255, 255, 255\)|#fff|#ffffff/i,
					status: /rgb\(125, 117, 105\)|#7d7569/i,
					divider: /rgb\(255, 206, 75\)|#ffce4b/i
				});
			});

			it('has the right colors for the deadblog', function(done){
				checkColors(done, {
					url: '/tone-deadblog.html',
					bg: /rgb\(255, 255, 255\)|#fff|#ffffff/i,
					type: /rgb\(51, 51, 51\)|#333|#333333/i,
					status: /rgb\(246, 246, 246\)|#f6f6f6/i,
					divider: /rgb\(181, 24, 0\)|#b51800/i
				});
			});

			it('has the right colors for the analisys', function(done){
				checkColors(done, {
					url: '/tone-analisys.html',
					bg: /rgb\(255, 255, 255\)|#fff|#ffffff/i,
					type: /rgb\(0, 86, 137\)|#005689/i,
					status: /rgb\(246, 246, 246\)|#f6f6f6/i,
					divider: /rgb\(0, 86, 137\)|#005689/i
				});
			});

			it('has the right colors for the podcasts', function(done){
				checkColors(done, {
					url: '/tone-podcast.html',
					bg: /rgb\(72, 72, 72\)|#484848/i,
					type: /rgb\(255, 255, 255\)|#fff|#ffffff/i,
					divider: /rgb\(167, 216, 242\)|#a7d8f2/i
				});
			});

		}

		afterEach(function(){
			sandbox.empty();
		});

		after(function(){
			sandbox.remove();
		});

	});

});


