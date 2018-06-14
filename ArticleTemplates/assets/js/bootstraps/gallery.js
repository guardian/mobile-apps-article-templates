define([
    'hammer'
],
function (
    Hammer
) {
    'use strict';

    function init() {

        // TODO:
        // + dont block scrolling
        // + bounce
        // - android: lock article swipe
        // - header CSS

        var galleryImages = document.querySelectorAll('.touch-gallery__images');
        galleryImages.forEach(function(galleryImage) {
            var mc = new Hammer.Manager(galleryImage);
            var pinch = new Hammer.Pinch();
            mc.add(pinch);

            mc.on('pinch', function(ev) {
                var desiredScale = ev.scale;
                var pinchCentre = getPinchCentre(galleryImage);

                galleryImage.style.transformOrigin = pinchCentre.x+'% '+pinchCentre.y+'%';
                galleryImage.style.transform = 'scale('+desiredScale+')';
            });

            mc.on('pinchstart', function(ev) {
                savePinchCentre(galleryImage, ev);
            });

            mc.on('pinchend', function() {
                bounceToInitialPosition(galleryImage);
            });

        });

        function getPinchCentre(el) {
            var pinchX = el.dataset.pinchCentreX;
            var pinchY = el.dataset.pinchCentreY;
            return {x: pinchX, y: pinchY};
        }

        function savePinchCentre(el, ev) {
            var elBounds = el.getBoundingClientRect();
            var pinchCentreX = calcPinchCentre(elBounds, ev.center, 'x', 'width');
            var pinchCentreY = calcPinchCentre(elBounds, ev.center, 'y', 'height');

            el.dataset.pinchCentreX = pinchCentreX;
            el.dataset.pinchCentreY = pinchCentreY;
        }

        function calcPinchCentre(elBounds, pinchCentre, axis, dimension) {
            var elStart = elBounds[axis];
            var elEnd = elBounds[dimension];
            var pinch = pinchCentre[axis];

            var pinchRel = (pinch-elStart)/(elEnd);
            if (pinchRel > 0.75) {
                return 100
            } else if (pinchRel < 0.25) {
                return 0
            } else {
                return Math.round(pinchRel*100);
            }
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
