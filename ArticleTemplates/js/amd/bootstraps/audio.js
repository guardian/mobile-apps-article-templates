/*global window,document,console,define */
define([
    'mobileSlider',
    'modules/$'
], function (
    mobileSlider,
    $
) {
    'use strict';

    var modules = {
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
                    }
                    $(".audio-knob").removeAttr("style");

                    var input1 = document.getElementById('audio-scrubber');
                    slider1 = new MobileRangeSlider('audio-slider', {
                        value: current,
                        min: 0,
                        max: duration,
                        change: function (percentage) {
                            audioCurrent = percentage;
                            input1.value = secondsTimeSpanToHMS(percentage);
                            $("#audio-scrubber-left").val("-" + secondsTimeSpanToHMS(duration - percentage));
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
                    iframe.setAttribute("src", "setPlayerTime:" + audioCurrent);
                    document.documentElement.appendChild(iframe);
                    iframe.parentNode.removeChild(iframe);
                    iframe = null;
                };
            },

            setupGlobals: function () {
                // Global function to handle audio, called by native code
                window.audioPlay = function () {
                    $('.audio-button span').html('&#xe04d;');
                };
                window.audioStop = function () {
                    $('.audio-button .icon').html("&#xe04b;");
                };
                window.audioBackground = function (duration) {
                    // Copied directly, needs cleaning
                    var numOfCircles = Math.floor((duration / 60) / 10) + 2,
                        h = $("#header").offset().height,
                        w = $("#header").offset().width,
                        size = (h * w) / 8000,
                        x = [],
                        y = [];

                    for (var i = 0; i < numOfCircles; i++) {
                        var attempt,
                            value = (Math.floor((Math.random() * w) + 1) / 20);

                        value = Math.floor(value) * 20;
                        if (x.indexOf(value) !== -1 && attempt < 3) {
                            i = i - 1;
                            attempt++;
                        } else {
                            x.push(value);
                            attempt = 0;
                        }
                    }

                    for (var i = 0; i < numOfCircles; i++) {
                        var attempt,
                            value = (Math.floor((Math.random() * h) + 1) / 20);

                        value = Math.floor(value) * 20;
                        if (y.indexOf(value) !== -1 && attempt < 3) {
                            i = i - 1;
                            attempt++;
                        } else {
                            y.push(value);
                            attempt = 0;
                        }
                    }

                    var ctx = document.getCSSCanvasContext("2d", "squares", w, h);
                    for (var i = 0; i < numOfCircles; i++) {
                        ctx.beginPath();
                        ctx.arc(x[i], y[i], size, 0, Math.PI * 2, true);
                        ctx.closePath();
                        ctx.fillStyle = "rgba(0,0,0,0.15)";
                        ctx.fill();
                        size = size * 1.3;
                    }
                };
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
        init: ready
    };

});
