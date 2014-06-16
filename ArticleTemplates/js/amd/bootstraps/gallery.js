/*global window,document,console,define */
define([
	'bean',
	'modules/$',
	'modules/collagePlus'
], function (
	bean,
	$,
	collagePlus
) {
	'use strict';

	var modules = {
		galleryLayout: function () {
			collagePlus.init();
			var windowWidth = window.innerWidth;
			var imageHeight;
			
			if (windowWidth < 450 ) {
				imageHeight = 150; 
			} else {
				imageHeight = 300;
			}
			
			$('.gallery__thumbnails').collagePlus({
					'targetHeight' : imageHeight
				});
			
			$(window).resize(function() {
				$('.gallery__thumbnails').removeAttr("style").collagePlus({
					'targetHeight' : imageHeight
				});
			});
		}
	},

	ready = function () {
		if (!this.initialised) {
			this.initialised = true;
			modules.galleryLayout();
			// console.info("Gallery ready");
		}
	};

	return {
		init: ready
	};
});
