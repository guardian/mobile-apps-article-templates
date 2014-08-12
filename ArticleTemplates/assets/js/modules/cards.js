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
                        $(".container--related").hide();
                    } else {
                        $(".container--related .container__body").html(html);
                        var comment_card_byline = $(".card--comment.has-image .card__byline");
                        var comment_card_header = $(".card--comment.has-image .card__titletext");
                        if (comment_card_byline.length>0)
                        {
                            for (var i=0;i<comment_card_byline.length;i++)
                            {
                                var  bylineLines=modules.getNumberOfTextLines(comment_card_byline[i]);
                                window.logOnScreen('debug msg bylineLines: '+bylineLines);
                                var  headerLines=modules.getNumberOfTextLines(comment_card_header[i]);
                                window.logOnScreen('debug msg headerLines: '+headerLines);
                                var  totalLines=bylineLines+headerLines;
                                window.logOnScreen('debug msg: '+totalLines);
                                if (totalLines>=4)
                                {
                                    bonzo(comment_card_byline[i]).hide();
                                    bonzo(comment_card_header[i]).attr('style','-webkit-line-clamp:4;');
                                    window.logOnScreen('debug msg inside:'+totalLines);
                                }
                            }
                        }
                    }
                };
                window.applyNativeFunctionCall('articleCardsInserter');
            },
            getNumberOfTextLines:function (el) {
                //returns number of text lines of single html element 
                var cssValues=window.getComputedStyle(el,null);
                var lineHeight=cssValues.lineHeight.replace('px','');
                window.logOnScreen('debug msg lineHeight: '+lineHeight);
                var paddingTop=cssValues.paddingTop.replace('px','');
                window.logOnScreen('debug msg paddingTop: '+paddingTop);
                var paddingBottom=cssValues.paddingBottom.replace('px','');
                window.logOnScreen('debug msg paddingBottom: '+paddingBottom);
                var elementheight=el.offsetHeight;
                window.logOnScreen('debug msg elementheight: '+elementheight);
                var numberOfLines= (elementheight-paddingTop-paddingBottom)/lineHeight;
                window.logOnScreen('debug msg numberOfLines: '+numberOfLines);
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