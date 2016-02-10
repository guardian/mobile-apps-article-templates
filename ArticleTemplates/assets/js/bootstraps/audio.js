/*global window,document,console,define */
define([
    'bean',
    'bonzo',
    'mobileSlider',
    'modules/$'
], function (
    bean,
    bonzo,
    mobileSlider,
    $
) {
    'use strict';

    var modules = {
        getColor: function(){
            var isAdv = $("body").hasClass("is_advertising");
            var isAudio = !$("body").hasClass("tone--podcast") && $(".article").hasClass("article--audio");
            return isAdv ? "rgba(105, 209, 202, 0.15)" : (isAudio ? "rgba(255, 187, 0, 0.05)" : "rgba(167, 216, 242, 0.10)");
        },

        audioSlider: function () {
            var audioCurrent,
                down,
                slider1,


                secondsTimeSpanToHMS = function (s) {
                    var m = Math.floor(s / 60);
                    s -= m * 60;
                    return (m < 10 ? '0' + m : m) + ":" + (s < 10 ? '0' + s : s);
                };

                window.superAudioSlider = function (current, duration, platform) {
                    if (platform === "iOS") {
                        if (down === 1) {
                            return;
                        }
                    } else if ($(".cutout__container").attr("data-background") === null && !$("body").hasClass("media")) {
                        window.audioBackground(duration);
                        bean.on(window, 'resize.audioPlayer orientationchange.audioPlayer', window.ThrottleDebounce.debounce(100, false, function () {
                            window.audioBackground(duration);
                        }));
                    }

                    $(".audio-player__slider__knob").removeAttr("style");
                    slider1 = new MobileRangeSlider('audio-player__slider', {
                        value: current,
                        min: 0,
                        max: duration,
                        change: function (percentage) {
                            audioCurrent = percentage;
                            $(".audio-player__slider__played").val(secondsTimeSpanToHMS(percentage));
                            $(".audio-player__slider__remaining").val("-" + secondsTimeSpanToHMS(duration - percentage));
                        }
                    });

                };

                window.updateSlider = function (current, platform) {
                    if (platform === "iOS") {
                        if (down === 1) {
                            return;
                        }
                    }
                    slider1.setValue(current);
                };

                document.addEventListener('touchstart', function () {
                    down = 1;
                }, false);

                document.addEventListener('touchend', function () {
                    down = 0;
                }, false);

                /* Caution: Hot Mess */
                MobileRangeSlider.prototype.end = function () {
                    this.removeEvents("move");
                    this.removeEvents("end");
                    var iframe = document.createElement("iframe");
                    iframe.setAttribute("src", "x-gu://setPlayerTime/" + audioCurrent);
                    document.documentElement.appendChild(iframe);
                    iframe.parentNode.removeChild(iframe);
                    iframe = null;
                };
            },

            setupGlobals: function () {
                // Global function to handle audio, called by native code
                window.audioPlay = function () {
                    $('.audio-player__button .touchpoint__button').attr('data-icon', '').addClass('pause').removeClass('play');
                };

                window.audioStop = function () {
                    $('.audio-player__button .touchpoint__button').attr('data-icon', '').addClass('play').removeClass('pause');
                };

                window.audioLoad = function () {
                    $(".audio-player__button").hide();
                    $(".audio-player__button--loading").css('display','block');
                };

                window.audioFinishLoad = function () {
                    $(".audio-player__button").show();
                    $(".audio-player__button--loading").hide();
                };

                window.audioBackground = function (duration) {
                    if ($(".cutout__background")) {
                        $(".cutout__background").remove();
                    }
                    var numOfCircles = Math.min(10, Math.floor((duration / 60) / 2)) + 2,
                        h = $(".cutout__container").offset().height,
                        w = $(".cutout__container").offset().width,
                        size = (h * w) / 8000,
                        canvas = document.createElement("canvas"),
                        ctx = canvas.getContext('2d');

                    canvas.width = w;
                    canvas.height = h;
                    canvas.className = "cutout__background";

                    // Draw Circles
                    for (var i = 0; i < numOfCircles; i++) {
                        var x = Math.floor(Math.random() * (w - 0) + 1);
                        ctx.beginPath();
                        ctx.arc(x, h / 2, size, 0, Math.PI * 2, true);
                        ctx.closePath();
                        ctx.fillStyle = modules.getColor();
                        ctx.fill();
                        size = size * 1.2;
                    }

                    $(".article__header").append(canvas);
                    $(".cutout__container").attr("data-background", "true");
                };

                window.applyNativeFunctionCall('audioBackground');
                window.applyNativeFunctionCall('superAudioSlider');
                window.applyNativeFunctionCall('audioPlay');
                window.applyNativeFunctionCall('audioStop');
            }
        },

        ready = function () {
            if (!this.initialised) {
                this.initialised = true;
                modules.audioSlider();
                modules.setupGlobals();
                // console.info("Audio ready");
            }
        };

    return {
        init: ready,
        modules: modules
    };

});
