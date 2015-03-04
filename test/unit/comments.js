define([
	'modules/comments',
	'bonzo',
	'bean',
	'modules/$'
], function(Comments, bonzo, bean, $){

	describe('Comments', function(){
		var sandbox;

		before(function(){
			sandbox = bonzo(bonzo.create('<div id="sandbox" style="visibility:hidden;"></div>'));
			sandbox.appendTo(document.body);
		});

		it('exists', function(){
			expect(Comments).to.be.defined;
		});

		if (navigator.userAgent.indexOf('PhantomJS') < 0) {
			it('keeps the recommend button "blue" after clicked', function(){
				recommend = bonzo(bonzo.create('<div id="1213"><p class="comment__recommend"><span class="comment__recommend__count"></span></p></div>'));
				recommend.appendTo(sandbox);
				Comments.modules.setupGlobals();
				window.commentsRecommendIncrease(1213,12)
				expect($('.comment__recommend', recommend[0]).hasClass('increase')).to.be.true;
				expect($('.comment__recommend__count', recommend[0]).text()).to.be.equal('12');
			});
		}

		afterEach(function(){
			//sandbox.empty();
		});

		after(function(){
			// sandbox.remove();
		});

	});

});
