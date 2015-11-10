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
                var articleheight = $('.article').offset().height; // progress bar
                var progressBar = $('.progress__bar');


                $('.immersive__main__image').css('height', bgHeight);

                $('figure.element--immersive').each(function(){
                   if($(this).next().hasClass('element-pullquote')){
                     $(this).next().addClass('quote--image');
                     $(this).addClass('quote--overlay'); 
                    }
                    
                   if($(this).next()[0].tagName === "H2"){
                       $(this).next().addClass('title--image');
                       $(this).addClass('title--overlay');
                       $(this).next().next().addClass('has__dropcap');
                   }
                });

                var selector = $('.quote--overlay').data('data-thing', '');
                var caption = $('.quote--overlay figcaption');

                bean.on(window, 'click', selector, function(){
                   console.log('clicked');
                   $(caption).toggleClass('display');
                   
               });

                $('h2').each(function() {
                    if ($(this).html() === '* * *') {
                        $(this).html('').addClass('section__rule').next().addClass('has__dropcap');
                        
                    }

                    
                   var chapterPosition = $(this).offset().top;
                   var chapterPositionPer = chapterPosition / articleheight * 100;
                   var charPos = Math.floor(chapterPositionPer) + "%";
                   var addChapeter = '<div style="position: absolute; left:'+ charPos + ';" class="chapter"></div>';
                   $('.progress').append(addChapeter);
                });

                $('.element-pullquote').each(function(){
                   var $this = $(this);
                   var offset = $this.offset().top;
                   
                   $this.attr('data-offset',offset);
                });

                bean.on(window, 'scroll', function(){
                   var scrollheight = window.scrollY / articleheight * 100; // progress bar
                   var scrollerwidth = scrollheight + "%"; // progress bar
                   $('.element-pullquote').each(function(){
                        var $this = $(this);
                        var dataOffset = $this.attr('data-offset');

                        if(window.scrollY >= (dataOffset - pageOffset)){
                            $this.addClass('animated').addClass('fadeInUp');
                        } 
                    });
                  progressBar.css('width', scrollerwidth); 
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
