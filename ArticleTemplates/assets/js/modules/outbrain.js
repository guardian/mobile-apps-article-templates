/*
 Module: outbrain.js
 Description: show promoted content by outbrain.
 */
define([
    'modules/$',
    'bonzo'
], function (
    $,
    bonzo
) {
	'use strict';

	var outbrainUrl = '//widgets.outbrain.com/outbrain.js';

	var contentStatus = function() {
 		var status = document.body.getAttribute('data-content-status');
	 	return status;
	}

	var device = function() {
		var deviceType = document.body.getAttribute('data-ads-config');
		return deviceType;
	}

	function getSection () {
		var sections = ['politics', 'world', 'business', 'commentisfree'];
		var section = document.body.getAttribute('data-content-section');
		return section.toLowerCase().match('news') || sections.indexOf(section.toLowerCase()) > 0 ? 'sections' : 'all';
	}

	function isAdsEnabled() {
		return document.body.getAttribute('data-ads-enabled') == 'mpu'; 
	}

	function getDataContentUrl() {
		return document.body.getAttribute('data-content-url');
	}

	function load() {
 		var status = contentStatus();
 		var outbrain = $('.container__oubrain');
 		var contentUrl = getDataContentUrl();

 		if (status != 'preview' && isAdsEnabled() && outbrain.length > 0 && contentUrl.length > 0) {
 			$('.container__oubrain').css('display', 'block');
				
        	var widgetConfig = {}, 
        		widgetCodeImage, widgetCodeText;
 
 			if (device() == 'tablet') {
 				$('.outbrainText').css('display', 'block');
 				widgetConfig = {
 					image: {
                        sections: 'MB_6',
                        all: 'MB_7'
                    },
                    text: {
                        sections: 'MB_8',
                        all: 'MB_9'
                    }
 				};
 				widgetCodeText = widgetConfig.text[getSection()];
 				$('.outbrainText').attr('data-widget-id', widgetCodeText);
 				$('.outbrainText').attr('data-src', contentUrl);
 			} else if (device() == 'mobile') {
				widgetConfig = {
 					image: {
                        sections: 'MB_4',
                        all: 'MB_5'
                    }
 				};
 			}

 			widgetCodeImage = widgetConfig.image[getSection()];
 			$('.outbrainImage').attr('data-widget-id', widgetCodeImage);
			$('.outbrainImage').attr('data-src', contentUrl);	

 			return require([outbrainUrl]);
 		}
	}

	return {
		load: load
	};
});