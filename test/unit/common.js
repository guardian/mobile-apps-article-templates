define([
	'bootstraps/common',
	'bonzo',
	'modules/$',
	'modules/more-tags'
], function(Common, bonzo, $, moreTags){

	describe('Common', function(){
		var sandbox;

		before(function(){
			sandbox = bonzo(bonzo.create('<div id="sandbox" style="visibility:visible;"></div>'));
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

		it('should prepare window.guardian', function(){
			$('body').attr('data-page-id', 'someurladdress');
			Common.modules.setGlobalObject(window);
			expect(window.guardian).to.be.not.null;
			expect(window.guardian.config.page.pageId).to.be.equal('someurladdress');
			$('body').attr('data-page-id', '__PAGE_ID__');
			Common.modules.setGlobalObject(window);
			expect(window.guardian.config.page.pageId).to.be.null;
		});

		it('should not trigger links on tab if only a single tab is present', function(){
			var click = document.createEvent("MouseEvent");
			click.initMouseEvent("click", true, true, window, null, 0, 0, 0, 0, false, false, false, false, 0, null);
			var root = { location: { }};
			var testContent = bonzo.create('<div role="tablist" class="tabs"><ul class="inline-list"><li role="presentation" class="inline-list__item"><a role="tab" class="tab" id="football__tab--article" href="#football__tabpanel--article" aria-controls="football__tabpanel--article" aria-selected="true">Report</a></li></ul></div>');
			var tab = $('a', testContent);
			$(testContent).appendTo(sandbox);
			Common.modules.showTabs(root);
  			tab[0].dispatchEvent(click);
  			expect(window.location.href).to.be.not.defined;
		});

		it('should do trigger links on tab if more than a tab is present', function(){
			var click = document.createEvent("MouseEvent");
			click.initMouseEvent("click", true, true, window, null, 0, 0, 0, 0, false, false, false, false, 0, null);
			var root = { location: { }};
			var testContent = bonzo.create('<div role="tablist" class="tabs"><ul class="inline-list"><li role="presentation" class="inline-list__item"><a role="tab" class="tab" id="football__tab--article" href="#football__tabpanel--article" aria-controls="football__tabpanel--article" aria-selected="true">Report</a></li><li role="presentation" class="inline-list__item"><a role="tab" class="tab" id="football__tab--stats" href="#football__tabpanel--stats" aria-controls="football__tabpanel--stats">Match Info</a></li></ul></div>');
			var tab = $('li:last-child a', testContent);
			$(testContent).appendTo(sandbox);
			Common.modules.showTabs(root);
  			tab[0].dispatchEvent(click);
  			expect(root.location.href).to.be.equal('x-gu://football_tab_stats');
  		});

		it('should add extra words to a series that occupy more than one line if the new line contains only one word', function(){
			var testContent = bonzo.create('<div style="width:340px; font-family: Courier; font-size: 10px;" class="content__series-label content__labels"><a>Nigel Slater recipes Nigel Slater recipes Nigel Slater recipes</a><div>');
			$(testContent).appendTo(sandbox);
			var series = $('a', testContent);			
			Common.modules.fixSeries(series);
			expect(series.html()).to.be.equal('<span>Nigel </span><span>Slater </span><span>recipes </span><span>Nigel </span><span>Slater </span><span>recipes </span><br><span>Nigel </span><span>Slater </span><span>recipes </span>');
		});

		it('should invoke (if available) window.GuardianJSInterface.firstPaintTime on firstPaint', function(done){
			window.chrome = { loadTimes: function(){ return { firstPaintTime: 10, startLoadTime: 5 }; }};
			window.GuardianJSInterface = { firstPaintTime: function(){ }};
			var firstPaintFn = sinon.spy(window.GuardianJSInterface, "firstPaintTime");
			Common.modules.sendFirstPaintTime();
			setTimeout(function(){
				expect(firstPaintFn).to.have.been.calledWithExactly(5);
				expect(firstPaintFn).to.have.been.called;
				done();
			}, 200);			
		});

		describe('Tags', function(){
			var tagsContainer;

			beforeEach(function(){
				Common.modules.insertTags();
				tagsContainer = bonzo.create('<div class="tags" id="tags"><ul class="inline-list" id="tag-list"><li class="inline-list__item screen-readable">Tags:</li></ul></div>');
				$(tagsContainer).appendTo(sandbox);
			});

			it('should display only 5 tags', function(done){
				var tags = '<li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/society/prisons-and-probation">Prisons and probation</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/law/law">Law</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/law/criminal-justice">UK criminal justice</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/society/society">Society</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/politics/chrisgrayling">Chris Grayling</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/politics/politics">Politics</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/profile/alantravis">Alan Travis</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/theguardian/mainsection">Main section</a></li>';
				var activeTagsSelector = 'li.inline-list__item:not(.hide-tags):not(.js-more-button):not(.screen-readable)';
				window.articleTagInserter(tags);
				expect($(activeTagsSelector).length).to.be.equal(5);
				moreTags.show();
				if (navigator.userAgent.indexOf('PhantomJS') < 0) {
					setTimeout(function(){
						expect($(activeTagsSelector).length).to.be.equal(8);
						done();
					}, 400);
				} else {
					done();
				}
			});

			it('should not display "More.." with only 5 tags present', function(){
				var tags = '<li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/society/prisons-and-probation">Prisons and probation</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/law/law">Law</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/law/criminal-justice">UK criminal justice</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/society/society">Society</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/politics/chrisgrayling">Chris Grayling</a></li>';
				window.articleTagInserter(tags);
				expect($('li.js-more-button').length).to.be.equal(0);
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
