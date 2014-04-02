/*global window,document,console,define */
define([
	'bean',
	'modules/$'
], function (
	bean,
	$
) {
	'use strict';

	var modules = {
		asideWitness: function () {
			// Moves the Witness aside to better place (4 paragraphs in)
			var bodyLength = $(".article__body p").length;
			if (bodyLength > 4) {
				$(".aside-witness").addClass("positioned").prependTo(".article__body p:nth-of-type(5)");
			} else {
				bodyLength = bodyLength - 1;
				$(".aside-witness").addClass("positioned").prependTo(".article__body p:nth-of-type(" + bodyLength + ")");
			}
		},

		figcaptionToggle: function () {
			// Show/hides figure caption
			bean.on($('.article__image-caption__icon')[0], 'click', function () {
				$('.article__image-caption__text').toggleClass('is-visible');
			});
		}
	},

	ready = function () {
		if (!this.initialised) {
			this.initialised = true;
			modules.asideWitness();
			modules.figcaptionToggle();
			// console.info("Article ready");
		}
	};

	return {
		init: ready
	};
});
