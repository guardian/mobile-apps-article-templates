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

	var isAndroid = $('body').hasClass('android');
	var outbrain = $('.container__oubrain');

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

	function getContentUrl () {
		var content = document.body.getAttribute('data-content-url');
	 	return content;
	}

	function isAdsEnabled() {
		return document.body.getAttribute('data-ads-enabled') == 'mpu'; 
	}

	function load() {
 		var status = contentStatus();
 		var contentUrl = getContentUrl();
		 		
 		if (status != 'preview' && isAdsEnabled() && outbrain.length > 0 && contentUrl.length > 0) {
 			outbrain.css('display', 'block');
				
        	var widgetConfig = {}, 
        		widgetCodeImage, widgetCodeText, scriptElement;
 
 			if (device() == 'tablet') {
 				$('.outbrainText').css('display', 'block');
 				widgetConfig = {
 					image: {
                        sections: isAndroid ? 'AR_25' : 'AR_24',
                        all: isAndroid ? 'AR_19' : 'AR_18'
                    },
                    text: {
                        sections: isAndroid ? 'AR_26' : 'AR_27',
                        all: isAndroid ?'AR_21' : 'AR_20'
                    }
 				};
 				widgetCodeText = widgetConfig.text[getSection()];
 				$('.outbrainText').attr('data-widget-id', widgetCodeText);
 				$('.outbrainText').attr('data-src', contentUrl);
 			} else if (device() == 'mobile') {
				widgetConfig = {
 					image: {
                        sections: isAndroid ? 'AR_23' : 'AR_22',
                        all: isAndroid ? 'AR_17' : 'AR_16'
                    }
 				};
 			}

 			widgetCodeImage = widgetConfig.image[getSection()];
 			$('.outbrainImage').attr('data-widget-id', widgetCodeImage);
 			$('.outbrainImage').attr('data-src', contentUrl);

 			scriptElement = document.createElement('script');
 			scriptElement.id = 'outbrain-widget';
 			scriptElement.async = true;
 			scriptElement.src = 'https://widgets.outbrain.com/outbrain.js';
 			$(document.body).append(scriptElement);
 		}
	}

	return {
		load: load
	};
});