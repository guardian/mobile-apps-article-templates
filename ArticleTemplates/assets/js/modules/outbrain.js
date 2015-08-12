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
	 };

	function getSection () {
		var section = document.body.getAttribute('data-content-section');
		return section;
	}

	function load(config) {
 		var status = contentStatus();
 		var outbrain = $('.container__oubrain');
 		if (status != 'preview' && config.adsEnabled == 'mpu' && outbrain.length > 0) {
 			$('.container__oubrain').attr('display', 'block');
				
        	var widgetIds = {},
        		widgetConfig = {},
        		widgetCode, widgetCodeImage, widgetCodeText;

        	widgetIds = {
					mobile: 'MB_2',
            	tablet: 'MB_1',
        	};
 			
 			if (config.adsConfig == 'tablet') {
 				$('.outbrainText').attr('display', 'block');
 				widgetConfig = {
 					image: {
                        sections: 'MB_6',
                        all     : 'MB_7'
                    },
                    text: {
                        sections: 'MB_8',
                        all     : 'MB_9'
                    }
 				};

 				widgetCodeText = widgetConfig.text[getSection()];
 			} else if (config.adsConfig == 'mobile') {
				widgetConfig = {
 					image: {
                        sections: 'MB_4',
                        all     : 'MB_5'
                    }
 				};
 			}

 			widgetCodeImage = widgetConfig.image[getSection()];
 			widgetCode = widgetCodeImage;
 		}

 		return require(['js!' + outbrainUrl]);
	}

	return {
		load: load
	};
});