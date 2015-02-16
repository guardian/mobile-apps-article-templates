define([
	'bootstraps/common',
	'bonzo',
	'modules/$'
], function(Common, bonzo, $){

	describe('Common', function(){
		var sandbox;

		before(function(){
			sandbox = bonzo(bonzo.create('<div id="sandbox" style="visibility:hidden;"></div>'));
			sandbox.appendTo(document.body);
		});

		it('exists', function(){
			expect(Common).to.be.defined;
		});

		it('should be able to resize vine iframes', function(){
			// from:  http://live-blogs.mobile-apps.guardianapis.com/newer/football/live/2015/jan/19/ghana-v-senegal-africa-cup-of-nations-2015-live?date=2015-01-19T17:09:12Z
			var outerContainer = bonzo.create('<div style="width: 300px"><iframe srcdoc=\"&lt;iframe class=&quot;vine-embed&quot; src=&quot;https://vine.co/v/OJO0JV7DKpF/embed/simple&quot; width=&quot;600&quot; height=&quot;600&quot; frameborder=&quot;0&quot;>&lt;/iframe> &lt;script async=&quot;&quot; src=&quot;https://platform.vine.co/static/scripts/embed.js&quot; charset=&quot;utf-8&quot;>&lt;/script>\" class=\"fenced\"></iframe></div>').pop();
			$(outerContainer).appendTo(sandbox);

			var outerFrame = $('iframe', outerContainer)[0];
			var innerFrame = bonzo.create(outerFrame.getAttribute('srcdoc')).shift();

			expect(innerFrame.getAttribute('width')).to.be.equal('600');
			Common.modules.fixVineWidth(outerContainer);
			innerFrame = bonzo.create(outerFrame.getAttribute('srcdoc')).shift();

			expect(innerFrame.getAttribute('width')).to.be.equal('300');
			expect(outerFrame.getAttribute('data-vine-fixed')).to.be.equal('true');
		});

		it('should not resize iframes which have already been resized', function(){
			var outerContainer = bonzo.create('<div style="width: 300px"><iframe data-vine-fixed="true" srcdoc=\"&lt;iframe class=&quot;vine-embed&quot; src=&quot;https://vine.co/v/OJO0JV7DKpF/embed/simple&quot; width=&quot;600&quot; height=&quot;600&quot; frameborder=&quot;0&quot;>&lt;/iframe> &lt;script async=&quot;&quot; src=&quot;https://platform.vine.co/static/scripts/embed.js&quot; charset=&quot;utf-8&quot;>&lt;/script>\" class=\"fenced\"></iframe></div>').pop();
			var outerFrame = $('iframe', outerContainer)[0];
			var innerFrame = bonzo.create(outerFrame.getAttribute('srcdoc')).shift();

			expect(innerFrame.getAttribute('width')).to.be.equal('600');
			Common.modules.fixVineWidth(outerContainer);
			innerFrame = bonzo.create(outerFrame.getAttribute('srcdoc')).shift();

			expect(innerFrame.getAttribute('width')).to.be.equal('600');
		});

		it('should force .pie-chart width to its parent width', function(){
			var testContent = bonzo.create('<div style="width:323px;height:500px;"><div class="pie-chart"></div></div>').pop();
			var pie = $('.pie-chart', testContent);
			$(testContent).appendTo(sandbox);
			Common.modules.setPieChartSize();
			expect(pie.offset().width).to.be.equal(323);
		});

		afterEach(function(){
			sandbox.empty();
		});

		after(function(){
			sandbox.remove();
		});

	});

});
