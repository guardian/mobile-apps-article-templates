/*global window,console,define */
define([
	'bean',
	'bonzo',
	'modules/$'
], function (
	bean,
	bonzo,
	$
) {
	'use strict';

	var modules = {
			setupGlobals: function () {
				// Function that loops through comments, hides replies and enables interactivity for comments
				window.commentsReplyFormatting = function () {
					var counter = 0;
					var stopPropagation = 0;
					
					$(".discussion__thread .discussion:nth-of-type(4)").append("<div class='discussion__view-more'><span class='icon'>&#xe002;</span> View more replies</div>");

					$(".discussion").each(function(el) {
					
						bean.on(el, 'click', 'a, .discussion__view-more, .discussion__reply, .discussion__recommend', function (event) {
							stopPropagation = 1;
						});
						
						bean.on(el, 'click', '.discussion__header, .discussion__body', function (event) {
							stopPropagation = 0;
						});
		 
						bean.on(el, 'click', function () {
							if (stopPropagation == 0) {
								block = $(el);
								if (block.hasClass('visible')) {
									if (block.hasClass('comments-open') === false) {
										$('.comments-open .discussion__options').toggle();
										$('.comments-open').removeClass('comments-open');
									}
									block.toggleClass('comments-open');
									$('.discussion__options', el).toggle(null, 'block');
								}
							}
						});
		 
						bean.on(el, 'click', '.discussion__view-more', function () {
							$(this).hide();
							$(this).parent().parent().addClass("expand");
						});
						
					});
				};
				// Global function to handle comments, called by native code
				window.articleCommentsInserter = function (html) {
					if (!html) {
						$('.discussion__empty').show();
						$('.discussion__loading').hide();
					} else {
						$('.discussion__loading').hide();
						html = bonzo.create(html);
						$(html).appendTo($('#comments'));
					}
				};
				window.commentsInserter = function (html) {
					if (!html) {
						$('.discussion__empty').show();
						$('.discussion__loading').hide();
					} else {
						html = bonzo.create(html);
						$(html).appendTo($('#comments'));
					}
					$('.discussion__loading').appendTo('#comments');
				};
				window.articleCommentsFailed = function () {
					$('.discussion__failed').show();
					$('.discussion__loading').hide();
					$('#module-comments').addClass('comments-has-failed');
				};
				window.commentsFailed = function () {
					$('.discussion__loading').hide();
					$('.discussion__failed').show();
					$('#comments').addClass('comments-has-failed');
				};
				window.commentsEnd = function () {
					$('.discussion__loading').remove();
				};
				window.commentsRecommendIncrease = function (id, number) {
					var target = '#' + id + ' .discussion__recommend';
					$(target).addClass('increase');
					$(target + ' .discussion__recommend__count').text(number);
				};
				window.commentsRecommendDecrease = function (id, number) {
					var target = '#' + id + ' .discussion__recommend';
					$(target).removeClass('increase');
					$(target + ' .discussion__recommend__count').text(number);
				};
				window.scrollToComments = function () {
					window.location.href = '#module-comments';
				};
				window.applyNativeFunctionCall('articleCommentsInserter');
				window.applyNativeFunctionCall('commentsFailed');
				window.applyNativeFunctionCall('commentsReplyFormatting');
			}
		},

		ready = function () {
			if (!this.initialised) {
				this.initialised = true;
				modules.setupGlobals();
				// console.info("Comments ready");
			}
		};

	return {
		init: ready
	};

});
