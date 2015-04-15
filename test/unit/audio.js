define([
	'bootstraps/audio',
	'bonzo',
	'bean',
	'modules/$'
], function(Audio, bonzo, bean, $){

	describe('Audio', function(){
		var sandbox;

		before(function(){
			sandbox = bonzo(bonzo.create('<div id="sandbox" style="visibility:hidden;"></div>'));
			sandbox.appendTo(document.body);
		});

		it('exists', function(){
			expect(Audio).to.be.defined;
		});

		it('changes the color if podcast or audio article', function(){
			var outerContainer = bonzo.create('<div class="article article--audio"></div>').pop();
			$(outerContainer).appendTo(sandbox);
			expect(Audio.modules.getColor()).to.be.equal('rgba(255, 187, 0, 0.05)');
		});

		afterEach(function(){
			sandbox.empty();
		});

		after(function(){
			sandbox.remove();
		});

	});

});