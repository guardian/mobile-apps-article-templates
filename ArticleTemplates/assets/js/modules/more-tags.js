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

    function MoreTags() {

        this.init = function () {
            var tags = $("#tags .inline-list__item a");
            var string = "<li class='inline-list__item more-button js-more-button'><a href='#' id='more'>more</a></li>";
            // var el = $("#more"); // *** Used for Bean not working ***
            var i = 0;

            function showTags(tags) {
                var i = 0;
                tags.each(function (index) {
                    console.log("Looping"+i);
                    if (i >= 5) {
                    $(this).parent().addClass("show-tags");
                    }
                    i++;
                });
            }
            
            tags.each(function (index) {
                console.log("Looping "+i);
                if (i == 4) {
                    console.log("5 "+ i);
                    string = bonzo.create(string);
                    $(string).insertAfter($(this).parent());
                } 

                if (i >= 5) {
                    $(this).parent().addClass("hide-tags");
                    console.log("6+ "+ i);
                }
                i++
            });

            // *** Bean On click not working correctly, using native JS ***
            // bean.on(el, 'click', function (tags) {
            //     showTags(tags);
            // });
            var el = document.getElementById("more").parentNode;
            el.addEventListener("click", function(){ showTags(tags) }, false);

        };

    }

    return MoreTags;

});