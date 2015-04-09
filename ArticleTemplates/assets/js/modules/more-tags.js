/*
 Module: more-tags.js
 Description: upgrades the 'Tags' list on content with a show more.
 */
define([
    'modules/$',
    'bean',
    'bonzo'
], function (
    $,
    bean,
    bonzo
) {

    var SHOW_TAGS = 5;
    var modules = {
        refresh: function(){
            if($('.tags .inline-list .inline-list__item').length > SHOW_TAGS + 1){
                $(moreButton).insertAfter('.tags .inline-list .inline-list__item:nth-child('+ (SHOW_TAGS + 1) + ')');
                $('#more-tags-contaier ~ .inline-list__item').addClass('hide-tags');
            }
        },
        show: function(){            
            $(moreButton).hide();
            setTimeout(function(){ $('#more-tags-contaier ~ .hide-tags').removeClass('hide-tags'); }, 200);
        }
    };

    var moreButton = bonzo.create("<li id='more-tags-contaier' class='inline-list__item more-button js-more-button'><a id='more'>More...</a></li>").pop();
    bean.on(moreButton, 'click', modules.show);

    return modules;

});