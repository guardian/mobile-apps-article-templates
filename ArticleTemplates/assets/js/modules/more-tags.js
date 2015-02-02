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

    var modules = {
        refresh: function(){
            $(moreButton).insertAfter('.tags .inline-list .inline-list__item:nth-child(6)');
            $('#more-tags-contaier ~ .inline-list__item').addClass('hide-tags');
        },
        show: function(){
            $('#more-tags-contaier ~ .hide-tags').removeClass('hide-tags');
            $(moreButton).hide();
        }
    };

    var moreButton = bonzo.create("<li id='more-tags-contaier' class='inline-list__item more-button js-more-button'><a id='more'>More...</a></li>").pop();
    bean.on(moreButton, 'click', modules.show);

    return modules;

});