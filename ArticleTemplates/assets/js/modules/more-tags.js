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
<<<<<<< HEAD
            var string = "<li class='inline-list__item more-button js-more-button'><a href='#' id='more'>more</a></li>";
            // var el = $("#more"); // *** Used for Bean not working ***
=======
            var string = "<li class='inline-list__item more-button js-more-button'><a id='more'>more</a></li>";
            // var el = $(".js-more-button"); // *** Used for Bean not working ***
>>>>>>> GIA-3300 - Tags fix for iOS, delay timing of loop for filtering tags
            var i = 0;

            // window.logOnScreen("Tags are "+tags);
            // window.logOnScreen("String is "+string);
            function showTags(tags, el) {
                var i = 0;
                // window.logOnScreen("EL "+el);
                tags.each(function (index) {
                    console.log("Looping"+i);
<<<<<<< HEAD
=======
                    window.logOnScreen("Looping"+i);
>>>>>>> GIA-3300 - Tags fix for iOS, delay timing of loop for filtering tags
                    if (i >= 5) {
                    $(this).parent().addClass("show-tags");
                    }
                    i++;
                });
                el.parentNode.removeChild(el);

            }

            tags.each(function () {
                // console.log("Module More Tags is Looping "+i);
                window.logOnScreen("Module More Tags is Looping "+i);
                if (i > 4) {
                    // console.log("5 "+ i);
                    window.logOnScreen("5 "+ i);
                    string = bonzo.create(string);
                    $(string).insertAfter($(this).parent());
                } 

                if (i >= 5) {
                    $(this).parent().addClass("hide-tags");
                    // console.log("6+ "+ i);
                    window.logOnScreen("6 "+ i);
                }
                i++;
            });

            // *** Bean On click not working correctly, using native JS ***
            // bean.on(el, 'click', function (tags) {
            //     showTags(tags);
            // });
            var el = document.getElementById("more").parentNode;
            el.addEventListener("click", function(){ showTags(tags, el); }, false);

        };

    }

    return MoreTags;

});