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
				// Global functions to handle comments, called by native code
				window.articleCardsInserter = function (html) {
					$(html).appendTo(".container--related .container__body");
				};
				window.applyNativeFunctionCall('articleCardsInserter');
			}
		},

		ready = function () {
			if (!this.initialised) {
				this.initialised = true;
				modules.setupGlobals();
				// console.info("Cards ready");
			}
		};

	return {
		init: ready
	};

});