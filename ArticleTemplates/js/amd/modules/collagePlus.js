/*!
 *
 * jQuery collagePlus Plugin v0.3.2
 * https://github.com/ed-lea/jquery-collagePlus
 *
 * Copyright 2012, Ed Lea twitter.com/ed_lea
 *
 * built for http://qiip.me
 *
 * Rewritten for the Guardian
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 *
 */

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
					$(html).appendTo(".module--related .module__body");
				};
				window.applyNativeFunctionCall('articleCardsInserter');
			}
		},

		init = function () {
			if (!this.initialised) {
				this.initialised = true;
				alert("hi");
				modules.setupGlobals();
				// console.info("Cards ready");
			}
		};

	return {
		init: init
	};

});