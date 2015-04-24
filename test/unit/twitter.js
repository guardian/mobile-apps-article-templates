define([
	'modules/twitter',
	'bonzo',
	'modules/$'
], function(Twitter, bonzo, $){

	describe('Twitter', function(){
		var sandbox;

		before(function(){
			sandbox = bonzo(bonzo.create('<div id="sandbox" style="visibility:hidden;"></div>'));
			sandbox.appendTo(document.body);
		});

		it('exists', function(){
			expect(Twitter).to.be.defined;
		});

		it('removes the vine embeds', function(done){
			// this test at the moment break phantomJS but works on chrome (http://localhost:3000/root/test/unit/runner.html)
			if (navigator.userAgent.indexOf('PhantomJS') < 0) {
				var demoTweet = bonzo(bonzo.create('<blockquote class="twitter-tweet"><p>hands up at the front of the march for <a href="https://twitter.com/johnlegend">@johnlegend</a> and common. <a href="https://twitter.com/hashtag/dream4justice?src=hash">#dream4justice</a> <a href="https://twitter.com/hashtag/blacklivesmatter?src=hash">#blacklivesmatter</a> <a href="https://t.co/x7jbmk9B5Y">https://t.co/x7jbmk9B5Y</a></p>— newyorkist (@Newyorkist) <a href="https://twitter.com/Newyorkist/status/557275005252546561">January 19, 2015</a></blockquote>'));
				demoTweet.appendTo(sandbox);
				twttr.events.bind('rendered', function(evt){
					Twitter.modules.fixVineAutoplay(evt);
					var media = $('iframe[src^="https://vine.co"]', evt.target.contentWindow.document);
					expect(media.length).to.be.equal(0);
					done();
				});
				twttr.widgets.load(sandbox[0]);
			}else{
				done();
			}
		});

		it('keeps all the other embeds', function(done){
			var demoTweet = bonzo(bonzo.create('<blockquote class="twitter-tweet"><p><a href="https://twitter.com/hashtag/ESM?src=hash">#ESM</a> MD <a href="https://twitter.com/hashtag/Regling?src=hash">#Regling</a> in interview w/ Japan. newspaper Nikkei <a href="https://twitter.com/nikkei">@nikkei</a> and Nikkei Asian Review <a href="https://twitter.com/NAR">@NAR</a> <a href="http://t.co/ZYeMSBSve5">http://t.co/ZYeMSBSve5</a> <a href="http://t.co/ti0DFCVzoh">pic.twitter.com/ti0DFCVzoh</a></p>— ESM (@ESM_Press) <a href="https://twitter.com/ESM_Press/status/563717403264417792">February 6, 2015</a></blockquote>'));
			demoTweet.appendTo(sandbox);
			twttr.events.bind('rendered', function(evt){
				Twitter.modules.fixVineAutoplay(evt);
				var media = $('.MediaCard', evt.target.contentWindow.document);
				expect(media.length).to.be.equal(1);
				done();
			});
			twttr.widgets.load(sandbox[0]);
		});

		afterEach(function(){
			sandbox.empty();
		});

		after(function(){
			sandbox.remove();
		});

	});

});
