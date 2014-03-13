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
						$(".article__body--liveblog__pinned").after(newBlockHtml);
						window.articleImageSizer();
						window.liveblogTime();
						newBlockHtml = '';
					};

				window.liveblogNewBlock = function (html) {
					newBlockHtml = html + newBlockHtml;
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
					$('.live-more-loading').show();
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
					$('.live-more-loading').hide();
					$(html).hide().appendTo('.article__body').show().addClass('animated bounceIn');

					// See Common bootstrap
					window.articleImageSizer();
					window.liveblogTime();
				};
				window.liveblogTime = function () {
					if ($('.article__section__live').length > 0 || $("#liveblog").hasClass("is-live")) {
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
				// console.info("Liveblog ready");
			}
		};

	return {
		init: ready
	};

});
