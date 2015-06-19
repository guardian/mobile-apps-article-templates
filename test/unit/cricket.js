define([
	'bootstraps/cricket',
	'bonzo',
	'bean',
	'modules/$'
], function(Cricket, bonzo, bean, $){

	describe('Cricket', function(){
		var sandbox;

		before(function(){
			sandbox = bonzo(bonzo.create('<div id="sandbox" style="visibility:hidden;"></div>'));
			sandbox.appendTo(document.body);
		});

		it('exists', function(){
			expect(Cricket).to.be.defined;
		});

		afterEach(function(){
			sandbox.empty();
		});

		after(function(){
			sandbox.remove();
		});

	});

});
