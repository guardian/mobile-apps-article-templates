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
            savePinchCentre(myElement, ev);
        });

        mc.on('pinchend', function() {
            bounceToInitialPosition(myElement);
        });

        function getPinchCentre(el) {
            var pinchX = el.dataset.pinchCentreX;
            var pinchY = el.dataset.pinchCentreY;
            return {x: pinchX, y: pinchY};
        }

        function calcPinchCentre(elBounds, pinchCentre, axis, dimension) {
            var elStart = elBounds[axis];
            var elEnd = elBounds[dimension];
            var pinch = pinchCentre[axis];

            var pinchRel = (pinch-elStart)/(elEnd);
            if (pinchRel > 0.80) {
                return 100
            } else if (pinchRel < 0.20) {
                return 0
            } else {
                return Math.round(pinchRel*100);
            }
        }

        function savePinchCentre(el, ev) {
            var elBounds = el.getBoundingClientRect();
            var pinchCentreX = calcPinchCentre(elBounds, ev.center, 'x', 'width');
            var pinchCentreY = calcPinchCentre(elBounds, ev.center, 'y', 'height');

            el.dataset.pinchCentreX = pinchCentreX;
            el.dataset.pinchCentreY = pinchCentreY;
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
