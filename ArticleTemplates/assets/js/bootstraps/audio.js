define([
    'mobileSlider'
], function (
    MobileRangeSlider
) {
    'use strict';

    var initialised,
        audioCurrent,
        down,
        slider1;

    function getColor() {
        var isAdv = document.body.classList.contains('is_advertising'),
            isAudio = !document.body.classList.contains('tone--podcast') && document.body.classList.contains('article--audio');
        
        return isAdv ? 'rgba(105, 209, 202, 0.15)' : (isAudio ? 'rgba(255, 187, 0, 0.05)' : 'rgba(167, 216, 242, 0.10)');
    }

    function secondsTimeSpanToHMS(s) {
        var m = Math.floor(s / 60);
        s -= m * 60;
        return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    }

    function superAudioSlider(current, duration, platform) {
        var audioPlayerSliderKnob,
            cutoutContainer = document.getElementsByClassName('cutout__container')[0];

        if (platform === 'iOS') {
            if (down === 1) {
                return;
            }
        } else if ((!cutoutContainer || !cutoutContainer.dataset.background) && !document.body.classList.contains('media')) {
            window.audioBackground(duration);

            window.addEventListener('resize', GU.util.debounce(function () {
                window.audioBackground(duration);
            }, 100));
        }

        audioPlayerSliderKnob = document.getElementsByClassName('audio-player__slider__knob')[0];

        if (audioPlayerSliderKnob) {
            audioPlayerSliderKnob.removeAttribute('style');
        }

        slider1 = new MobileRangeSlider('audio-player__slider', {
            value: current,
            min: 0,
            max: duration,
            change: changeSlider.bind(null, duration)
        });
    }

    function changeSlider(duration, percentage) {
        var audioPlayerSliderPlayed = document.getElementsByClassName('audio-player__slider__played')[0],
            audioPlayerSliderRemaining = document.getElementsByClassName('audio-player__slider__remaining')[0];            

        audioCurrent = percentage;

        if (audioPlayerSliderPlayed) {
            audioPlayerSliderPlayed.value = secondsTimeSpanToHMS(percentage);
        }

        if (audioPlayerSliderRemaining) {
            audioPlayerSliderRemaining.value = '-' + secondsTimeSpanToHMS(duration - percentage);
        }
    }

    function updateSlider(current, platform) {
        if (platform === 'iOS') {
            if (down === 1) {
                return;
            }
        }

        slider1.setValue(current);
    }

    function audioSlider() {
        document.addEventListener('touchstart', function () {
            down = 1;
        }, false);

        document.addEventListener('touchend', function () {
            down = 0;
        }, false);

        /* Caution: Hot Mess */
        MobileRangeSlider.prototype.end = function () {
            this.removeEvents('move');
            this.removeEvents('end');

            GU.util.signalDevice('setPlayerTime/' + audioCurrent);
        };
    }

    function audioPlay() {
        var button = document.getElementsByClassName('audio-player__button')[0];

        if (button) {
            button.classList.add('pause');
        }
    }

    function audioStop() {
        var button = document.getElementsByClassName('audio-player__button')[0];

        if (button) {
            button.classList.remove('pause');
        }
    }

    function audioLoad() {
        var button = document.getElementsByClassName('audio-player__button')[0],
            loadingButton = document.getElementsByClassName('audio-player__button--loading')[0];

        button.style.display = 'none';
        loadingButton.style.display = 'block';
    }

    function audioFinishLoad() {
        var button = document.getElementsByClassName('audio-player__button')[0],
            loadingButton = document.getElementsByClassName('audio-player__button--loading')[0];

        button.style.display = 'block';
        loadingButton.style.display = 'none';
    }

    function audioBackground(duration) {
        var cutoutBackground = document.getElementsByClassName('cutout__background')[0],
            cutoutContainer = document.getElementsByClassName('cutout__container')[0];

        if (cutoutBackground) {
            cutoutBackground.parentNode.removeChild(cutoutBackground);
        }

        if (cutoutContainer) {
            styleCutoutContainer(duration, cutoutContainer);
        }
    }

    function styleCutoutContainer(duration, cutoutContainer) {
        var articleHeader = document.getElementsByClassName('article__header')[0],
            numOfCircles = Math.min(10, Math.floor((duration / 60) / 2)) + 2,
            h = GU.util.getElementOffset(cutoutContainer).height,
            w = GU.util.getElementOffset(cutoutContainer).width,
            size = (h * w) / 8000,
            canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');

        canvas.width = w;
        canvas.height = h;
        canvas.className = 'cutout__background';

        // Draw Circles
        for (var i = 0; i < numOfCircles; i++) {
            var x = Math.floor(Math.random() * (w - 0) + 1);
            ctx.beginPath();
            ctx.arc(x, h / 2, size, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fillStyle = getColor();
            ctx.fill();
            size = size * 1.2;
        }


        articleHeader.appendChild(canvas);
        cutoutContainer.dataset.background = 'true';
    }

    function setupGlobals() {
        // Global function to handle audio, called by native code
        window.superAudioSlider = superAudioSlider;
        window.updateSlider = updateSlider;
        window.audioPlay = audioPlay;
        window.audioStop = audioStop;
        window.audioLoad = audioLoad;
        window.audioFinishLoad = audioFinishLoad;
        window.audioBackground = audioBackground;

        window.applyNativeFunctionCall('audioBackground');
        window.applyNativeFunctionCall('superAudioSlider');
        window.applyNativeFunctionCall('audioPlay');
        window.applyNativeFunctionCall('audioStop');
    }

    function ready() {
        if (!initialised) {
            initialised = true;

            audioSlider();
            setupGlobals();
        }
    }

    return {
        init: ready
    };
});
