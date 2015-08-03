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
                    if (!html) {
                        modules.articleCardsFailed();
                    } else {
                        $(".container--related").removeClass('container--has-failed');
                        $(".container--related .container__body").html(html);
                        var comment_card_byline = $(".card--comment.has-image .card__byline");
                        var comment_card_header = $(".card--comment.has-image .card__titletext");
                        if (comment_card_byline.length>0)
                        {
                            for (var i=0;i<comment_card_byline.length;i++)
                            {
                                var  bylineLines=modules.getNumberOfTextLines(comment_card_byline[i]);
                                var  headerLines=modules.getNumberOfTextLines(comment_card_header[i]);
                                var  totalLines=bylineLines+headerLines;
                                if (totalLines>=4)
                                {
                                    bonzo(comment_card_byline[i]).hide();
                                    bonzo(comment_card_header[i]).attr('style','-webkit-line-clamp:4;');
                                }
                            }
                        }
                    }
                };
                window.articleCardsFailed = function(){
                   modules.articleCardsFailed();
                };
               
                window.applyNativeFunctionCall('articleCardsInserter');
                window.applyNativeFunctionCall('articleCardsFailed');
            },



            articleCardsFailed: function(){
                $(".container--related").addClass('container--has-failed');
            },
            getNumberOfTextLines:function (el) {
                //returns number of text lines of single html element
                var cssValues=window.getComputedStyle(el,null);
                var lineHeight=cssValues.lineHeight.replace('px','');
                var paddingTop=cssValues.paddingTop.replace('px','');
                var paddingBottom=cssValues.paddingBottom.replace('px','');
                var elementheight=el.offsetHeight;
                var numberOfLines= (elementheight-paddingTop-paddingBottom)/lineHeight;
                return parseInt(numberOfLines);
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