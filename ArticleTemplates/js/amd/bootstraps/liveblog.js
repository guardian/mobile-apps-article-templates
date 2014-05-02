/*global window,console,define */
define([
	'bean',
	'bonzo',
	'modules/relativeDates',
	'modules/$'
], function (
	bean,
	bonzo,
	relativeDates,
	$
) {
	'use strict';

	var modules = {
			blockUpdates: function () {
				var newBlockHtml = '',
					updateCounter = 0,
					liveblogStartPos = $('.live-container').offset(),

					liveblogNewBlockDump = function () {
						newBlockHtml = bonzo.create(newBlockHtml);
						$(newBlockHtml).each(function() {
							$(this).addClass("animated slideInRight");
						});
						$(".article__body--liveblog__pinned").after(newBlockHtml);

						// See Common bootstrap
						window.articleImageSizer();
						window.liveblogTime();
						window.loadEmbeds();
						window.loadInteractives();
						newBlockHtml = '';
					};

				window.liveblogNewBlock = function (html) {
					newBlockHtml = html + newBlockHtml;
					console.log(newBlockHtml);
					if (liveblogStartPos.top > window.scrollY) {
						liveblogNewBlockDump();
					}
				};

				window.applyNativeFunctionCall('liveblogNewBlock');

				bean.on(window, 'scroll', function () {
					if (liveblogStartPos.top > window.scrollY) {
						liveblogNewBlockDump();
					}
				});
			},

			liveMore: function () {
				bean.on($('.live-more')[0], 'click', function () {
					$(this).hide();
					$('.live-more-loading').addClass("live-more-loading--visible");
					window.location.href = 'x-gu://showmore';
				});
			},

			setupGlobals: function () {
				// Global function to handle liveblogs, called by native code
				window.liveblogDeleteBlock = function (blockID) {
					$('#' + blockID).remove();
				};
				window.liveblogUpdateBlock = function (blockID, html) {
					$("#" + blockID).replaceWith(html);
				};
				window.liveblogLoadMore = function (html) {
					html = bonzo.create(html);
					$('.live-more-loading').removeClass("live-more-loading--visible");
					$(html).each(function() {
						$(this).addClass("animated slideInRight");
					});
					$(html).appendTo('.article__body');

					// See Common bootstrap
					window.articleImageSizer();
					window.liveblogTime();
					window.loadEmbeds();
					window.loadInteractives();
				};
				window.liveblogTime = function () {
					if ($('.article__section__live').length > 0 || $("#liveblog").hasClass("is-live") || $("#liveblog .article__body--liveblog").hasClass("is-live")) {
						relativeDates.init('p.block-time', 'title');
					} else {
						$('p.block-time').each(function (el) {
							$(el).html(el.getAttribute('title'));
						});
					}
				};
				window.showLiveMore = function (show) {
					if (show) {
						$('.live-more').show();
					} else {
						$('.live-more').hide();
					}
				};

				window.applyNativeFunctionCall('liveblogDeleteBlock');
				window.applyNativeFunctionCall('liveblogUpdateBlock');
			}
		},

		ready = function () {
			if (!this.initialised) {
				this.initialised = true;
				modules.setupGlobals();
				window.liveblogTime();
				modules.blockUpdates();
				modules.liveMore();
				setInterval(liveblogTime, 30000);
				// console.info("Liveblog ready");
			}
		};

	return {
		init: ready
	};
});