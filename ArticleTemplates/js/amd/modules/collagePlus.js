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
	
	function resizeRow(obj, row, settings, rownum) {
		var imageExtras 			= (settings.padding * (obj.length - 1)),
			albumWidthAdjusted 		= settings.albumWidth - imageExtras,
			overPercent 			= albumWidthAdjusted / (row - imageExtras),
			trackWidth 				= imageExtras,
			lastRow 				= (row < settings.albumWidth ? true : false);

		for (var i = 0; i < obj.length; i++) {
			var $obj 				= $(obj[i][0]),
				fw					= Math.floor(obj[i][1] * overPercent),
				fh 					= Math.floor(obj[i][2] * overPercent),
				isNotLast			= !!(( i < obj.length - 1));

			if (settings.allowPartialLastRow === true && lastRow === true) {
				fw = obj[i][1];
				fh = obj[i][2];
			}

			trackWidth += fw;

			if (!isNotLast && trackWidth < settings.albumWidth) {
				if (settings.allowPartialLasRow === true && lastRow === true) {
					fw = fw;
				} else {
					fw = fw + (settings.albumWidth - trackWidth);
				}
			}

			// var $img = ( $obj.is("img") ) ? $obj : $obj.find("img");
			$obj.css({
				width: fw,
				height: fh
			});

			applyModifications($obj, isNotLast, settings);
		}
	}

	function applyModifications($obj, isNotLast, settings) {
		var css = {
			marginBottom			: settings.padding,
			marginRight				: (isNotLast) ? settings.padding : 0,
			display					: settings.display,
			verticalAlign			: "bottom",
			overflow				: "hidden"
		};
		
		return $obj.parent().css(css);
	}

	function init (selector, children) {
		var settings = {
			"targetHeight"			: 400,
			"albumWidth"			: $(selector)[0].clientWidth - 24,
			"padding"				: 12,
			"images"				: $(children),
			"fadeSpeed"				: "fast",
			"display"				: "inline-block",
			"effect"				: "default",
			"direction"				: "vertical",
			"allowPartialLastRow"	: false
		}

		var row = 0,
			elements = [],
			rownum = 1;

		settings.images.each(function(scope, index) {
			var w = this.width,
				h = this.height;

			// Store these values for resize?!?
			
			console.log(settings.albumWidth);

			var nw = Math.ceil(w/h*settings.targetHeight),
				nh = Math.ceil(settings.targetHeight);
			
			elements.push([this, nw, nh]);
			
			row += nw + settings.padding;
			
			if (row > settings.albumWidth && elements.length != 0) {
				resizeRow(elements, (row - settings.padding), settings, rownum);

				row = 0;
				elements = [];
				rownum += 1;
			}
			
			if (settings.images.length-1 == index && elements.length != 0) {
				resizeRow(elements, row, settings, rownum);
				
				row = 0;
				elements = [];
				rownum += 1;
			}
			
		});

		if (!this.initialised) {
			this.initialised = true;
			// console.info("Cards ready");
		}
	};

	return {
		init: init
	};

});