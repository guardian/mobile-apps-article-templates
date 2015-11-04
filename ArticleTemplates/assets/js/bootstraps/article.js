/*global window,document,console,define */
define([
    'bean',
    'bonzo',
    'modules/$',
    'modules/twitter',
    'modules/witness',
    'modules/outbrain'
], function (
    bean,
    bonzo,
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
	        if($('.immersive').length){
                var viewPortHeight = bonzo.viewport().height;
                var bgHeight = (viewPortHeight - $('body').css('margin-top').replace('px','')) + 'px';
                var pageOffset = viewPortHeight * 0.75;

                $('.immersive__main__image').css('height', bgHeight);

	        	$('h2').each(function() {
		        	if ($(this).html() === '* * *') {
			        	$(this).html('').addClass('section__rule').next().addClass('has__dropcap');
			        	
			        } else if($(this).html().toLowerCase().match(/[a-z]/)){
				        $(this).addClass('section__header');
			        }      
		        });		        
		        $('.element-pullquote').each(function(){
			       var $this = $(this);
			       var offset = $this.offset().top;
			       
			       $this.attr('data-offset',offset);
		        });
		        bean.on(window, 'scroll', function(){
			       $('.element-pullquote').each(function(){
				       	var $this = $(this);
				       	var dataOffset = $this.attr('data-offset');

			        	if(window.scrollY >= (dataOffset - pageOffset)){
				   			$this.addClass('animated').addClass('fadeInUp');
		           		} 
		        	});
			      			       
		       	});
		        
		        
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
