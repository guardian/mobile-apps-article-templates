define([
    'hammer'
],
function (
    Hammer
) {
    'use strict';

    function init() {
        var myElement = document.querySelector('.touch-gallery__images');

        var mc = new Hammer.Manager(myElement);
        var pinch = new Hammer.Pinch();
        mc.add(pinch);


        mc.on('pinch', function(ev) {
            var desiredScale = ev.scale;
            var pinchCentre = getPinchCentre(myElement);

            console.log(pinchCentre.x+'% '+pinchCentre.y+'%');

            myElement.style.transformOrigin = pinchCentre.x+'% '+pinchCentre.y+'%';
            myElement.style.transform = 'scale('+desiredScale+')';
        });

        mc.on('pinchstart', function(ev) {
            saveTouchCentre(myElement, ev);
        });

        mc.on('pinchend', function() {
            bounceToInitialPosition(myElement);
        });

        function getPinchCentre(el) {
            var pinchX = el.dataset.pinchCentreX;
            var pinchY = el.dataset.pinchCentreY;
            return {x: pinchX, y: pinchY};
        }
        function saveTouchCentre(el, ev) {

            var elXStart = myElement.getBoundingClientRect().x;
            var elXEnd = myElement.getBoundingClientRect().width;
            var pinchX = ev.center.x;
            var pinchXRelative = Math.round((pinchX-elXStart)/(elXEnd)*100);

            var elYStart = myElement.getBoundingClientRect().y;
            var elYEnd = myElement.getBoundingClientRect().height;
            var pinchY = ev.center.y;
            var pinchYRelative = Math.round((pinchY-elYStart)/(elYEnd)*100);

            el.dataset.pinchCentreX = pinchXRelative;
            el.dataset.pinchCentreY = pinchYRelative;
        }

        function bounceToInitialPosition(el) {
            el.style.transform = '';
            el.style.top = '';
            el.style.left = '';

            el.dataset.baseScale = 1;
            el.dataset.baseRotation = 0;
            el.dataset.basePanX = 0;
            el.dataset.basePanY = 0;
        }

    }

    return {
        init: init
    };
});
