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

	},

	ready = function () {
		if (!this.initialised) {
			this.initialised = true;
			// console.info("Gallery ready");
		}
	};

	return {
		init: ready
	};
});
