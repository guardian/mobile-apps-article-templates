define([
	'bonzo',
	'modules/$',
	'modules/monitor'
], function(bonzo, $, monitor){

	describe('Monitor', function(){
		var sandbox;

		before(function(){
			sandbox = bonzo(bonzo.create('<div id="sandbox" style="visibility:hidden;"></div>'));
			sandbox.appendTo(document.body);
		});

		it('exists', function(){
			expect(monitor).to.be.defined;
			expect(monitor.raven.config).to.be.defined;
		});

		it('detects item id, item tone, device kind and ads state from body attrs and classes', function(){
			$('body').addClass('tone--news')
				.attr('data-ads-config', 'mobile')
				.attr('data-page-id', '1231244214')
				.attr('data-ads-enabled', 'true');

			var tags = monitor.modules.extractTags('fakeUA');
			expect(tags.itemTone).to.be.equal('news');
			expect(tags.itemId).to.be.equal('1231244214')
			expect(tags.deviceKind).to.be.equal('mobile');
			expect(tags.ads).to.be.true;
		});

		it('starts raven on init', function(){
			monitor.init();
			expect(monitor.raven.isSetup()).to.be.true;
		});

		it('uses a special array with push turned off for ignoreErrors', function(){
			var fakeArray = monitor.modules.ignoreErrors();
			expect(fakeArray.length).to.be.equal(1);
			fakeArray.push('another item');
			expect(fakeArray.length).to.be.equal(1);
			expect(fakeArray[0]).to.be.equal('fake');
		});

		afterEach(function(){
			sandbox.empty();
		});

		after(function(){
			sandbox.remove();
		});

	});

});
