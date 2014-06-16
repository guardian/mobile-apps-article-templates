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
			collagePlus.init(".gallery__thumbnails", ".gallery__thumbnails__image");

			window.onorientationchange = function(){
				$(".gallery__thumbnails")[0].removeAttribute("style");
				collagePlus.init(".gallery__thumbnails", ".gallery__thumbnails__image");
			}
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
