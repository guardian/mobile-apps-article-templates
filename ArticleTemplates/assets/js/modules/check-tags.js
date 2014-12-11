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

    function CheckTags() {
        this.init = function () {

            var tags = $("#tags .inline-list__item a");

            var moreButton = "<li class='inline-list__item js-more-tags more-tags'   >" +
                             "<button class='u-button-reset js-more-tags__link button button--small button--tag button--tone-live-variant button--more' data-link-name='more-tags'>More…</button>" +
                             "</li>";


            var total = tags.length;
            for (i = 0; i < tags.length; i++) {
              console.log( "try " + i );
              if (i == 5) { 
                //bonzo(element).html(moreButton); 
                console.log(moreButton)
                }
              // if (i >= 5) { $(this).addClass('more-tag'); }
            }
        };
    }

    return CheckTags;

});