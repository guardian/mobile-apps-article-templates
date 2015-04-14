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

			xit('comply to shim.js policy', function(){
				$('body').addClass('android');
				window.initMpuPoller();
				expect(poller).to.not.have.been.called;
				Ads.init({adsEnabled: "true", adsConfig: 'mobile'});
				expect(poller).to.have.been.called;
				window['initMpuPollerQueue'] = [];
			});

			xit('Dont automatically polls on Android', function(){
				$('body').addClass('android');
				Ads.init({adsEnabled: "true", adsConfig: 'mobile'});
				expect(poller).to.not.have.been.called;
				$('body').removeClass('android');
			});

			xit('Polls on iOs', function(){
				Ads.init({adsEnabled: "true", adsConfig: 'mobile'});
				expect(poller).to.have.been.called
			});

			xit('Contiune polling regarding the fact that the content is interactive or not', function(done){
				$('body').addClass('android');
				Ads.init({adsEnabled: "true", adsConfig: 'mobile'});
				window.initMpuPoller();
				setTimeout(function(){
					expect(poller).to.have.been.called;
					expect(poller).not.to.have.been.calledOnce;
					$('body').removeClass('android');
					done();
				}, 1900);
			});

			xit('Doesnt invoke updateAndroidPosition when y doesnt change', function(done){
				$('body').addClass('android');
				Ads.init({adsEnabled: "true", adsConfig: 'mobile'});
				window.initMpuPoller()
				updateposition = sinon.spy(Ads.modules, "updateAndroidPosition");
				setTimeout(function(){
					expect(updateposition).not.to.have.been.called;
					done();
				}, 1000);
			});

			xit('Doesnt invoke mpuAdsPosition if x,y,w,h are 0', function(){
				var hiddenAdvPlaceholder = bonzo.create('<div style="display:none;"><div id="advert-slot__wrapper"></div></div>');
				$(hiddenAdvPlaceholder).appendTo(sandbox);
				var nativeInterface = sinon.spy();
				Ads.modules.getMpuPos(nativeInterface);
				expect(nativeInterface).not.to.have.been.called;
			});

			afterEach(function(){
				Ads.modules.poller.restore();
			});
		});

		
		describe('its banners on mobile', function(){

			beforeEach(function(){
				Ads.initialised = false;
			});

			xit('Doesnt add the banner placeholder with adsEnabled = "mpu"', function(){
				var banner = bonzo.create('<div class="advert-config--mobile" data-ads-enabled="mpu"><div id="test-banner" class="advert-slot advert-slot--banner advert-slot--__ADS_ENABLED__" id="banner_container"><div class="advert-slot__label">Advertisement<a class="advert-slot__action" href="x-gu://subscribe">Hide<span data-icon="&#xe04F;"></span></a></div><div class="advert-slot__wrapper"></div></div></div></div>');
				$(banner).appendTo(sandbox);
				expect(getComputedStyle($('#test-banner',banner)[0]).getPropertyValue('display')).to.be.equal('none');
			});

			it('Does add the mpu placeholder with adsEnabled = "banner"', function(){
				var bannerPlaceholder = bonzo.create('<div class="article_body"><div><p></p><p></p><p></p><p></p><p></p><p></p><p></p></div></div>');
				$(bannerPlaceholder).appendTo(sandbox);
				$('body').attr('data-ads-enabled','banner');
				Ads.init({adsEnabled: 'banner', adsConfig: 'mobile'});
			});

		});

		afterEach(function(){
			//sandbox.empty();
		});

		after(function(){
			//sandbox.remove();
		});

	});

});
