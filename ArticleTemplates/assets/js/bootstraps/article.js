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
	        	$('h2').each(function() {
		        	if ($(this).html() === '* * *') {
			        	$(this).html('').addClass('section__rule').next().addClass('has__dropcap');
			        }      
		        });
		        
		        $('.element--immersive').each(function(){
			        console.log($(this).next());
			       if($(this).next().hasClass('element-pullquote')){
				       console.log('somethig here');
			       	 $(this).next().addClass('quote--image');
			       	 $(this).addClass('quote--overlay'); 
			        }
		        });
		        
				var viewPortHeight = bonzo.viewport().height;
				var pageOffset = viewPortHeight * 0.75;
				var articleheight = $('.article').offset().height; // progress bar 
		        $('.element-pullquote').each(function(){
			       var $this = $(this);
			       var offset = $this.offset().top;
			       $this.attr('data-offset',offset);
		        });
		        
		        $('h2').each(function(){
			       var chapterPosition = $(this).offset().top;
			       var chapterPositionPer = chapterPosition / articleheight * 100;
			       var charPos = Math.floor(chapterPositionPer) + "%";
			       var addChapeter = '<div style="position: absolute; left:'+ charPos + ';" class="chapter"></div>';
			       $('.progress').append(addChapeter);	      
			    });
		        
		        bean.on(window, 'scroll', function(){
			       var scrollheight = window.scrollY / articleheight * 100; // progress bar
			       var scrollerwidth = scrollheight + "%"; // progress bar
			       $('.element-pullquote').each(function(){
				       	var $this = $(this);
				       	var dataOffset = $this.attr('data-offset');
				       	console.log('data-offset', dataOffset);
			        	if(window.scrollY >= (dataOffset - pageOffset)){
				   			$this.addClass('animated').addClass('fadeInUp');
				   			console.log('added class');   		
		           		} 
		        	});
			      $('.progress__bar').css('width', scrollerwidth); 	// progress bar    
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
