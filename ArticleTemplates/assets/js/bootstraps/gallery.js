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
                lockArticleSwipe(true);
                savePinchCentre(galleryImage, ev);
                loadHighRes(galleryImage);
            });

            mc.on('pinchend', function() {
                lockArticleSwipe(false);
                bounceToInitialPosition(galleryImage);
            });

        });

        function loadHighRes(el) {
            if (!el.classList.contains('high-res-setup')) {
                el.classList.add('high-res-setup');
                var highRes = el.querySelector('.touch-gallery__images__high-res');
                highRes.setAttribute('src', highRes.dataset.src);
                highRes.addEventListener('load', function() {
                    el.classList.add('high-res-loaded');
                })
            }
        }

        function lockArticleSwipe(toggle) {
            var isAndroidApp = (window.location.origin === "file://" && /(android)/i.test(navigator.userAgent) ) ? true : false;
            if (isAndroidApp) {
                window.GuardianJSInterface.registerRelatedCardsTouch(toggle);
            }
        }

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
            var currentScale = (el.getBoundingClientRect().width/el.offsetWidth);
            var newScale = currentScale + (1-currentScale)/5;
            if (newScale > 0.99 && newScale < 1.01) {
                el.style.transform = 'scale(1)';
                lockArticleSwipe(false);
            } else {
                el.style.transform = 'scale('+newScale+')';
                requestAnimationFrame(function() {
                    bounceToInitialPosition(el);
                });
            }
        }

    }

    return {
        init: init
    };
});
