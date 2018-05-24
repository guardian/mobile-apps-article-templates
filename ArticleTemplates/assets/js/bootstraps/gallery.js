define([
    'hammer'
],
function (
    Hammer
) {
    'use strict';

    function init() {
        console.log(Hammer);

        var myElement = document.querySelector('.hammer-test');

        var mc = new Hammer.Manager(myElement);

        // create a pinch and rotate recognizer
        // these require 2 pointers
        var pinch = new Hammer.Pinch();
        var rotate = new Hammer.Rotate();

        // we want to detect both the same time
        pinch.recognizeWith(rotate);

        // add to the Manager
        mc.add([pinch, rotate]);


        mc.on("pinch rotate", function(ev) {
            myElement.textContent += ev.type +" ";
        });

    }

    return {
        init: init
    };
});
