define([
	'modules/ads',
	'bonzo',
	'modules/$'
], function(Ads, bonzo, $){

	describe('Ads', function(){
		var sandbox;

		before(function(){
			sandbox = bonzo(bonzo.create('<div id="sandbox" style="visibility:hidden;"></div>'));
			sandbox.appendTo(document.body);
		});

		it('exists', function(){
			expect(Ads).to.be.defined;
		});

		describe('its poller', function(){
			var poller ;

			beforeEach(function(){				
				Ads.initialised = false;
				poller = sinon.spy(Ads.modules, "poller");
			});

			it('comply to shim.js policy', function(){
				$('body').addClass('android');
				window.initMpuPoller();
				expect(poller).to.not.have.been.called;
				Ads.init({adsEnabled: "true", adsConfig: 'mobile'});
				expect(poller).to.have.been.called;
				window['initMpuPollerQueue'] = [];
			});			

			it('Dont automatically polls on Android', function(){
				$('body').addClass('android');
				Ads.init({adsEnabled: "true", adsConfig: 'mobile'});
				expect(poller).to.not.have.been.called;
				$('body').removeClass('android');
			});

			it('Polls on iOs', function(){			
				Ads.init({adsEnabled: "true", adsConfig: 'mobile'});
				expect(poller).to.have.been.called
			});

			afterEach(function(){
				Ads.modules.poller.restore();
			});
		});

		afterEach(function(){
			sandbox.empty();
		});

		after(function(){
			sandbox.remove();
		});

	});

});
