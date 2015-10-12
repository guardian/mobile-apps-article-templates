/*global window,document,console,define */
define([
    'bean',
    'modules/$',
    'modules/twitter',
    'modules/witness',
    'modules/outbrain'
], function (
    bean,
    $,
    twitter,
    witness,
    outbrain
) {
    'use strict';

    var modules = {
        insertOutbrain: function () {
            window.articleOutbrainInserter = function () {
                outbrain.load();
            };
            window.applyNativeFunctionCall('articleOutbrainInserter');       
        },
        
        formatImmersive : function(){
	        if($('.tone--immersive').length){
	        	$('h2').each(function() {
		        	if ($(this).html() === '* * *') {
			        	$(this).html('').addClass('section__rule').next().addClass('has__dropcap');
			        	
			        }       
		        });
		        
		        var quotePosition = $('.element-pullquote').offset();
		        var scroll = $(window).scrollTop();
		        var value = scroll - quotePosition;
		        console.log(value);
		        console.log(scroll);
		        console.log(quotePosition);
		        
		        
		        
		        
	        }
        }
    },

    ready = function () {
        if (!this.initialised) {
            this.initialised = true;
            twitter.init();
            twitter.enhanceTweets();
            witness.duplicate();
            modules.insertOutbrain();
            modules.formatImmersive();
        }
    };

    return {
        init: ready
    };
});
