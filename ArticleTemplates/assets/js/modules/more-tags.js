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
    var initialised;
    var moreButton;

    function init() {
        if ($('.tags .inline-list .inline-list__item').length > SHOW_TAGS + 1) {
            moreButton = bonzo.create("<li id='more-tags-container' class='inline-list__item more-button js-more-button'><a id='more'>More...</a></li>").pop();
    
            bean.on(moreButton, 'click', show);

            $(moreButton).insertAfter('.tags .inline-list .inline-list__item:nth-child('+ (SHOW_TAGS + 1) + ')');
            
            $('#more-tags-container ~ .inline-list__item').addClass('hide-tags');
        }

    }

    function show() {            
        $(moreButton).hide();
        
        setTimeout(function(){ $('#more-tags-container ~ .hide-tags').removeClass('hide-tags'); }, 200);
    }

    return {
        init: init
    }

});