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
				recommend = bonzo(bonzo.create('<div class="container--comments"><a class="comment__recommend touchpoint touchpoint--secondary touchpoint--small" href="x-gu://recommendcomment/48001935"><span class="touchpoint__button" data-icon="" aria-hidden="true"></span><span class="touchpoint__label comment__recommend__count">1 <span class="screen-readable">recommendations. Tap to recommend.</span></span></a></div>'));
				recommend.appendTo(sandbox);
				Comments.modules.setupChecked();
				var target = $('a',recommend[0]);
				var ev = document.createEvent("MouseEvent");
				ev.initMouseEvent("click", true, true, window, null, 0, 0, 0, 0, false, false, false, false, 0, null);
				target[0].dispatchEvent(ev);
				expect(target.hasClass('comment__recommend--checked')).to.be.true;
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
