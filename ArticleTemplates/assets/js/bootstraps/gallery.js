define([
    'hammer'
],
function (
    Hammer
) {
    'use strict';

    function init() {
        var myElement = document.querySelector('.hammer-test__inner');

        var mc = new Hammer.Manager(myElement);

        var pan = new Hammer.Pan();
        var pinch = new Hammer.Pinch();
        var rotate = new Hammer.Rotate();

        pinch.recognizeWith(rotate);
        mc.add([pan, pinch, rotate]);


        // // TODO:
        // max left / right panning (bounce back?)
        // bounceToInitialPosition on scroll
        // make bounceToInitialPosition bounce instead of snapping

        // save pinch ending-scale
        mc.on('rotateend', function(ev) {
            var p = calcPinch(myElement, ev);

            if (p.scale < 1) {
                bounceToInitialPosition(myElement);
            } else {
                myElement.dataset.baseScale = p.scale;
                myElement.dataset.baseRotation = p.rotation;
            }

        });

        mc.on('rotate', function(ev) {
            var p = calcPinch(myElement, ev);
            myElement.style.transform = 'scale('+p.scale+') rotate('+p.rotation+'deg)';
        });

        mc.on('pan', function(ev) {
            var p = calcPan(myElement, ev);
            myElement.style.left = p.panX + 'px';
            myElement.style.top = p.panY + 'px';
        });

        mc.on('panend', function(ev) {
            var p = calcPan(myElement, ev);
            myElement.dataset.basePanX = p.panX;
            myElement.dataset.basePanY = p.panY;
        });

        function calcPan(el, ev) {
            var basePanX = el.dataset.basePanX;
            basePanX = basePanX!==undefined ? parseFloat(basePanX) : 0;

            var basePanY = el.dataset.basePanY;
            basePanY = basePanY!==undefined ? parseFloat(basePanY) : 0;

            var desiredPanX = basePanX+ev.deltaX;
            var desiredPanY = basePanY+ev.deltaY;

            return {panX: desiredPanX, panY: desiredPanY};
        }

        function calcPinch(el, ev) {
            var baseScale = el.dataset.baseScale;
            baseScale = baseScale!==undefined ? parseFloat(baseScale) : 1;

            var baseRotation = el.dataset.baseRotation;
            baseRotation = baseRotation!==undefined ? parseFloat(baseRotation) : 0;

            var desiredScale = baseScale*ev.scale;
            var desiredRotation = baseRotation+ev.rotation;

            return {scale: desiredScale, rotation: desiredRotation};
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
