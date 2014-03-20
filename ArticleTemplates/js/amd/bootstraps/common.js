/*global window,document,console,require,define */
define([
	'bean',
	'bonzo',
	'fence',
	'fastClick',
	'modules/ads',
	'modules/comments',
	'modules/$'
], function (
	bean,
	bonzo,
	fence,
	FastClick,
	Ads,
	Comments,
	$
) {
	'use strict';

	var modules = {
			attachFastClick: function () {
				// Polyfill to remove click delays on browsers with touch UIs
				FastClick.attach(document.body);
			},

			correctCaptions: function () {
				// Remove empty captions from figures
				$('figure').each(function (el) {
					var figcaption = $('figcaption', el);
					if (figcaption.length === 0 || figcaption.text() === '') {
						figcaption.hide();
						// $(el).css('border-bottom', 'none');
					}
				});
			},

			loadAdverts: function (config) {
				// Setup ad tags, insert containers
				Ads.init(config);
			},

			loadComments: function () {
				//
				Comments.init();
			},

			loadInteractives: function () {
				// Boot interactives
				window.loadInteractives = function () {
					$('figure.interactive').each(function (el) {
						var bootUrl = el.getAttribute('data-interactive');
						// The contract here is that the interactive module MUST return an object
						// with a method called 'boot'.
						require([bootUrl], function (interactive) {
							// We pass the standard context and config here, but also inject the
							// mediator so the external interactive can respond to our events.
							interactive.boot(el, document.body);
						});
					});
				};
				window.loadInteractives();
			},

			loadEmbeds: function() {
				// Boot Fenced Embeds
				window.loadEmbeds = function () {
					require(['fence'], function(fence) {
						$("iframe.fenced").each(function(node) {
							alert("Found a fence");
							fence.render(node);
						});
					});
					
				};
				window.loadEmbeds();
			},

			imageSizer: function () {
				// Resize figures to fit images
				window.articleImageSizer = function () {
					$('figure > img').each(function (el) {
						var imageWidth = el.getAttribute('width') || $(el).dim().width,
							imageClass = imageWidth < 301 ? 'figure-inline' : 'figure-wide',
							parent = $(el).parent();

						parent.addClass(imageClass);
						if (parent.hasClass('figure-inline')) {
							// Can this class only come from the above?
							parent.css('width', imageWidth);
						}
					});
				};
				window.articleImageSizer();
			},

			insertTags: function () {
				// Tag Function
				window.articleTagInserter = function (html) {
					html = bonzo.create(html);
					$(html).appendTo('.article__tags .list');
				};
				window.applyNativeFunctionCall('articleTagInserter');
			},

			offline: function() {
				// Function that gracefully fails when the device is offline
				if ($(document.body).hasClass('offline')) {
					$(".article img").each(function() {
						var element = $(this);
						var img = new Image();
						img.onerror = function() {
							if ($(element).parent().attr("class") == "element-image-inner") {
								$(element).hide();
							} else {
								$(element).replaceWith("<div class='element-image-inner'></div>");
							}
						}
						img.src = $(this).attr("src");
					});
				}
			},

			setupAlertSwitch: function () {
				// Global function to switch follow alerts, called by native code
				window.alertSwitch = function (following, followid) {
					var followObject = $('.article__alerts[follow-alert-id="' + followid + '"]');
					if (followObject.length) {
						if (following == 1) {
							if (followObject.hasClass('following') === false) {
								followObject.addClass('following');
							}
						} else {
							if (followObject.hasClass('following')) {
								followObject.removeClass('following');
							}
						}
					}
				};
			},

			setupFontSizing: function () {
				// Global function to resize font, called by native code
				window.fontResize = function (current, replacement) {
					$(document.body).removeClass(current).addClass(replacement);
				};
			},
			

			setupOfflineSwitch: function() {
				// Function that allows templates to better handle offline, called by native code
				window.offlineSwitch = function () {
					$(document.body).addClass("offline");
				}
			},

			showTabs: function () {
				// Set up tab events, show only first child
				$('.tabs li').each(function (el, i) {
					var tabGroup = el.getAttribute('data-href');
					if (i > 0) {
						$(tabGroup).hide();
					}
					bean.on(el, 'click', function () {
						var parent = $(this).parent(),
							classToHide = $('.selected', parent).attr('data-href'),
							classToShow = $(this).attr('data-href');

						$('.selected', parent).removeClass('selected');
						$(this).addClass('selected');

						$(classToHide).hide();
						$(classToShow).show();
					});
				});

			}
		},

		ready = function (config) {
			if (!this.initialised) {
				this.initialised = true;

				/*
				 These methods apply to all templates, if any should
				 only run for articles, move to the Article bootstrap.
				*/

				modules.attachFastClick();
				modules.correctCaptions();
				modules.imageSizer();
				modules.insertTags();
				modules.loadAdverts(config);
				modules.loadComments();
				modules.loadEmbeds();
				modules.loadInteractives();
				modules.offline();
				modules.setupOfflineSwitch();
				modules.setupAlertSwitch();
				modules.setupFontSizing();
				modules.showTabs();
				// console.info("Common ready");
			}
		};

	return {
		init: ready
	};

});
