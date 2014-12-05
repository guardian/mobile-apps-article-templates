/*
 Module: more-tags.js
 Description: upgrades the 'Tags' list on content with a show more.
 */
define([
    'common/utils/$',
    'bean'
], function (
    $,
    bean
) {

    function CheckTags() {
        this.init = function () {
            var counter = 0;
            $("#tags .inline-list__item a").each(function(node) {
            counter++;
            });
        };
    }

    return CheckTags;

});