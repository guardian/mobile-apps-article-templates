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

			it('Contiune polling regarding the fact that the content is interactive or not', function(done){
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

			it('Doesnt invoke updateAndroidPosition when y doesnt change', function(done){
				$('body').addClass('android');
				Ads.init({adsEnabled: "true", adsConfig: 'mobile'});
				window.initMpuPoller()
				updateposition = sinon.spy(Ads.modules, "updateAndroidPosition");
				setTimeout(function(){
					expect(updateposition).not.to.have.been.called;
					done();
				}, 1000);
			});

			it('Doesnt invoke mpuAdsPosition if x,y,w,h are 0', function(){
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

		
		describe('its ads on mobile', function(){

			beforeEach(function(){
				Ads.initialised = false;
			});

			it('Doesnt add the banner placeholder with adsEnabled = "mpu"', function(){
				var banner = bonzo.create('<div class="advert-config--mobile" data-ads-enabled="mpu"><div id="test-banner" class="advert-slot advert-slot--banner advert-slot--__ADS_ENABLED__" id="banner_container"><div class="advert-slot__label">Advertisement<a class="advert-slot__action" href="x-gu://subscribe">Hide<span data-icon="&#xe04F;"></span></a></div><div class="advert-slot__wrapper"></div></div></div></div>');
				$(banner).appendTo(sandbox);
				expect(getComputedStyle($('#test-banner',banner)[0]).getPropertyValue('display')).to.be.equal('none');
			});

			it('Does add the mpu placeholder with adsEnabled = "mpu"', function(){
				var bannerPlaceholder = bonzo.create('<div class="advert-config--mobile" data-ads-enabled="mpu"><div class="article__body"><div><p></p><p></p><p></p><p></p><p></p><p></p><p></p></div></div></div></div>');
				$(bannerPlaceholder).appendTo(sandbox);
				Ads.init({adsEnabled: 'mpu', adsConfig: 'mobile'});
				expect(getComputedStyle($('.advert-slot',bannerPlaceholder)[0]).getPropertyValue('display')).to.be.equal('block');
			});

			it('Does add the banner placeholder with adsEnabled = "banner"', function(){
				var banner = bonzo.create('<div class="advert-config--mobile" data-ads-enabled="banner"><div id="test-banner" class="advert-slot advert-slot--banner advert-slot--__ADS_ENABLED__" id="banner_container"><div class="advert-slot__label">Advertisement<a class="advert-slot__action" href="x-gu://subscribe">Hide<span data-icon="&#xe04F;"></span></a></div><div class="advert-slot__wrapper"></div></div></div></div>');
				$(banner).appendTo(sandbox);
				expect(getComputedStyle($('#test-banner',banner)[0]).getPropertyValue('display')).to.be.equal('block');
			});

			it('Doesnt add the mpu placeholder with adsEnabled = "banner"', function(){
				var bannerPlaceholder = bonzo.create('<div class="advert-config--mobile" data-ads-enabled="banner"><div class="article__body"><div><p></p><p></p><p></p><p></p><p></p><p></p><p></p></div></div></div></div>');
				$(bannerPlaceholder).appendTo(sandbox);
				Ads.init({adsEnabled: 'banner', adsConfig: 'mobile'});
				expect($('.advert-slot',bannerPlaceholder)[0]).to.be.undefined;
			});

			it('Adds mpu and banner with adsEnabled = "banner,mpu"', function(){
				var banner = bonzo.create('<div class="advert-config--mobile" data-ads-enabled="banner,mpu"><div id="test-banner" class="advert-slot advert-slot--banner advert-slot--__ADS_ENABLED__" id="banner_container"><div class="advert-slot__label">Advertisement<a class="advert-slot__action" href="x-gu://subscribe">Hide<span data-icon="&#xe04F;"></span></a></div><div class="advert-slot__wrapper"></div></div></div><div class="article__body"><div><p></p><p></p><p></p><p></p><p></p><p></p><p></p></div></div></div></div>');	
				$(banner).appendTo(sandbox);
				Ads.init({adsEnabled: 'banner,mpu', adsConfig: 'mobile'});
				expect(getComputedStyle($('#test-banner',banner)[0]).getPropertyValue('display')).to.be.equal('block');
				expect(getComputedStyle($('.advert-slot',banner)[0]).getPropertyValue('display')).to.be.equal('block');
			});

			it('Adds mpu and banner with adsEnabled = "true"', function(){
				var banner = bonzo.create('<div class="advert-config--mobile" data-ads-enabled="true"><div id="test-banner" class="advert-slot advert-slot--banner advert-slot--__ADS_ENABLED__" id="banner_container"><div class="advert-slot__label">Advertisement<a class="advert-slot__action" href="x-gu://subscribe">Hide<span data-icon="&#xe04F;"></span></a></div><div class="advert-slot__wrapper"></div></div></div><div class="article__body"><div><p></p><p></p><p></p><p></p><p></p><p></p><p></p></div></div></div></div>');	
				$(banner).appendTo(sandbox);
				Ads.init({adsEnabled: 'true', adsConfig: 'mobile'});
				expect(getComputedStyle($('#test-banner',banner)[0]).getPropertyValue('display')).to.be.equal('block');
				expect(getComputedStyle($('.advert-slot',banner)[0]).getPropertyValue('display')).to.be.equal('block');
			});		

			it('obeys rule #1 by default mpu after the 6th paragraph', function(){
				var bannerPlaceholder = bonzo.create('<div class="advert-config--mobile" data-ads-enabled="mpu"><div class="article__body"><div><p></p><p></p><p></p><p></p><p></p><p></p><p></p></div></div></div></div>');
				$(bannerPlaceholder).appendTo(sandbox);
				Ads.init({adsEnabled: 'mpu', adsConfig: 'mobile'});
				expect($(".article__body > div > *:nth-child(7)").hasClass('advert-slot')).to.be.true; 
			});

			it('obeys rule #2 mpu should sit between two text paragraphs', function(){
				var bannerPlaceholder = bonzo.create('<div class="advert-config--mobile" data-ads-enabled="banner"><div class="article__body"><div><p></p><p></p><p></p><p></p><p></p><p></p><div></div><p></p><p></p><p></p></div></div></div></div>');
				$(bannerPlaceholder).appendTo(sandbox);
				Ads.init({adsEnabled: 'mpu', adsConfig: 'mobile'});
				expect($(".article__body > div > *:nth-child(9)").hasClass('advert-slot')).to.be.true;			
			});

			it('it allows to configure the number of paragraphs before the mpu', function(){
				var bannerPlaceholder = bonzo.create('<div class="advert-config--mobile" data-ads-enabled="mpu"><div class="article__body"><div><p></p><p></p><p></p><p></p><p></p><p></p><p></p></div></div></div></div>');
				$(bannerPlaceholder).appendTo(sandbox);
				Ads.init({adsEnabled: 'mpu', adsConfig: 'mobile', mpuAfterParagraphs: '4'});
				expect($(".article__body > div > *:nth-child(5)").hasClass('advert-slot')).to.be.true; 				
			});

			it('it enforce the default if no value has been provided (__MPU_AFTER_PARAGRAPHS__)', function(){
				var bannerPlaceholder = bonzo.create('<div class="advert-config--mobile" data-ads-enabled="mpu"><div class="article__body"><div><p></p><p></p><p></p><p></p><p></p><p></p><p></p></div></div></div></div>');
				$(bannerPlaceholder).appendTo(sandbox);
				Ads.init({adsEnabled: 'mpu', adsConfig: 'mobile', mpuAfterParagraphs: '__MPU_AFTER_PARAGRAPHS__'});
				expect($(".article__body > div > *:nth-child(7)").hasClass('advert-slot')).to.be.true; 				
			});	

			it('doesnt raise an exception if adsEnabled is null', function(){
				var bannerPlaceholder = bonzo.create('<div class="advert-config--mobile" data-ads-enabled="mpu"><div class="article__body"><div><p></p><p></p><p></p><p></p><p></p><p></p><p></p></div></div></div></div>');
				$(bannerPlaceholder).appendTo(sandbox);
				expect(function(){
					Ads.init({adsEnabled: null, adsConfig: 'mobile', mpuAfterParagraphs: '__MPU_AFTER_PARAGRAPHS__'});
				}).to.not.throw(Error);
			});

		});

		describe('its ads on tablet', function(){

			beforeEach(function(){
				Ads.initialised = false;
			});

			it('Doesnt add the mpu placeholder with adsEnabled = "banner"', function(){
				var bannerPlaceholder = bonzo.create('<div class="advert-config--tablet" data-ads-enabled="banner"><div class="article__body"><div><p></p><p></p><p></p><p></p><p></p><p></p><p></p></div></div></div></div>');
				$(bannerPlaceholder).appendTo(sandbox);
				Ads.init({adsEnabled: 'banner', adsConfig: 'tablet'});
				expect($('.advert-slot',bannerPlaceholder)[0]).to.be.undefined;
			});

			it('Does add the mpu placeholder with adsEnabled = "mpu"', function(){
				var bannerPlaceholder = bonzo.create('<div class="advert-config--tablet" data-ads-enabled="mpu"><div class="article__body"><div><p></p><p></p><p></p><p></p><p></p><p></p><p></p></div></div></div></div>');
				$(bannerPlaceholder).appendTo(sandbox);
				Ads.init({adsEnabled: 'mpu', adsConfig: 'tablet'});
				expect(getComputedStyle($('.advert-slot',bannerPlaceholder)[0]).getPropertyValue('display')).to.be.equal('block');
			});

		});

		describe('its fast ads-ready callback', function(){

			beforeEach(function(){
				Ads.initialised = false;
			});

			it('implements ads-ready when required', function(){
				$('body').attr('data-use-ads-ready', 'true');
				var _window = {location: {}};
				Ads.modules.fireAdsReady(_window);
				expect(_window.location.href).to.be.equal('x-gu://ads-ready');
			});

			it('implements ads-ready when required', function(){
				$('body').attr('data-use-ads-ready', '__ADS_FAST_CALLBACK__');
				var _window = {location: {}};
				Ads.modules.fireAdsReady(_window);
				expect(_window.location.href).to.be.not.defined;
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
