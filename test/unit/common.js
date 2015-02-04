define([
	'bootstraps/common',
	'bonzo',
	'modules/$',
	'modules/more-tags'
], function(Common, bonzo, $, moreTags){

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

		it('should prepare window.guardian', function(){
			$('body').attr('data-page-id', 'someurladdress');
			Common.modules.setGlobalObject(window);
			expect(window.guardian).to.be.not.null;
			expect(window.guardian.config.page.pageId).to.be.equal('someurladdress');
			$('body').attr('data-page-id', '__PAGE_ID__');
			Common.modules.setGlobalObject(window);
			expect(window.guardian.config.page.pageId).to.be.null;
		});

		it('should display only 5 tags', function(){
			Common.insertTags();
			var tagsContainer = bonzo.create('<div class="tags" id="tags"><ul class="inline-list" id="tag-list"><li class="inline-list__item screen-readable">Tags:</li></ul></div>');
			$(tagsContainer).appendTo(sandbox);
			var tags = '<li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/society/prisons-and-probation">Prisons and probation</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/law/law">Law</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/law/criminal-justice">UK criminal justice</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/society/society">Society</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/politics/chrisgrayling">Chris Grayling</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/politics/politics">Politics</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/profile/alantravis">Alan Travis</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/theguardian/mainsection">Main section</a></li>';			
			var activeTagsSelector = 'li.inline-list__item:not(.hide-tags):not(.js-more-button):not(.screen-readable)';
			window.articleTagInserter(tags);

			expect($(activeTagsSelector).length).to.be.equal(5);
			moreTags.show();
			expect($(activeTagsSelector).length).to.be.equal(8);
		});

		describe('Tags', function(){
			var tagsContainer;

			beforeEach(function(){
				Common.insertTags();
				tagsContainer = bonzo.create('<div class="tags" id="tags"><ul class="inline-list" id="tag-list"><li class="inline-list__item screen-readable">Tags:</li></ul></div>');
				$(tagsContainer).appendTo(sandbox);
			});

			it('should display only 5 tags', function(){
				var tags = '<li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/society/prisons-and-probation">Prisons and probation</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/law/law">Law</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/law/criminal-justice">UK criminal justice</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/society/society">Society</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/politics/chrisgrayling">Chris Grayling</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/politics/politics">Politics</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/profile/alantravis">Alan Travis</a></li><li class="inline-list__item"><a href="x-gu://list/http://mobile-apps.guardianapis.com/lists/tag/theguardian/mainsection">Main section</a></li>';
				var activeTagsSelector = 'li.inline-list__item:not(.hide-tags):not(.js-more-button):not(.screen-readable)';
				window.articleTagInserter(tags);
				expect($(activeTagsSelector).length).to.be.equal(5);
				moreTags.show();
				expect($(activeTagsSelector).length).to.be.equal(8);
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
