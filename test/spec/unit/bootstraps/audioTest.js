define([
    // 'modules/util',
    'squire'
], function(
    // util,
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/bootstraps/audio', function() {
        var sandbox,
            container,
            injector;

        var utilMock,
            mobileSliderMock;

        beforeEach(function() {
            container = document.createElement('div');
            container.id = 'container';
            document.body.appendChild(container);
            injector = new Squire();
            window.applyNativeFunctionCall = sinon.spy();
            sandbox = sinon.sandbox.create();
            mobileSliderMock = sinon.spy();
            window.GU = {
                opts: {
                    isAdvertising: ''
                }
            };
            utilMock = {
                debounce: function (func) {
                    return func;
                },
                getElementOffset: function() {
                    return {
                        height: 300,
                        width : 500
                    }
                }
            };
            // window.GU.util = util;
        });

        afterEach(function () {
            document.body.removeChild(container);

            delete window.audioPlay;
            delete window.audioStop;
            delete window.audioLoad;
            delete window.audioFinishLoad;
            delete window.audioBackground;
            delete window.superAudioSlider;
            delete window.updateSlider;
            delete window.applyNativeFunctionCall;
            delete window.MobileRangeSlider;
            delete window.GU;

            sandbox.restore();
        });

        describe('init()', function () {
            it('sets up global functions', function (done) {
               injector
                    .mock('mobileSlider', mobileSliderMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/audio'], function (audio) {
                        audio.init();

                        expect(window.audioPlay).to.not.be.undefined;
                        expect(window.audioStop).to.not.be.undefined;
                        expect(window.audioLoad).to.not.be.undefined;
                        expect(window.audioFinishLoad).to.not.be.undefined;
                        expect(window.audioBackground).to.not.be.undefined;
                        expect(window.superAudioSlider).to.not.be.undefined;
                        expect(window.updateSlider).to.not.be.undefined;

                        expect(window.applyNativeFunctionCall).to.have.been.calledWith('audioBackground');
                        expect(window.applyNativeFunctionCall).to.have.been.calledWith('superAudioSlider');
                        expect(window.applyNativeFunctionCall).to.have.been.calledWith('audioPlay');
                        expect(window.applyNativeFunctionCall).to.have.been.calledWith('audioStop');

                        done();
                    });
            });
        });

        describe('window.audioPlay()', function () {
            it('updates touchPointButton', function (done) {
               injector
                    .mock('mobileSlider', mobileSliderMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/audio'], function (audio) {
                        var playerButton = document.createElement('div');

                        playerButton.classList.add('audio-player__button');
                    
                        container.appendChild(playerButton);

                        audio.init();

                        window.audioPlay();

                        expect(playerButton.classList.contains('pause')).to.eql(true);

                        done();
                    });
            });
        });

        describe('window.audioStop()', function () {
            it('updates touchPointButton', function (done) {
               injector
                    .mock('mobileSlider', mobileSliderMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/audio'], function (audio) {
                        var playerButton = document.createElement('div');

                        playerButton.classList.add('audio-player__button');

                        container.appendChild(playerButton);

                        audio.init();

                        window.audioStop();

                        expect(playerButton.classList.contains('pause')).to.eql(false);
                        
                        done();
                    });
            });
        });

        describe('window.audioLoad()', function () {
            it('hides audio player button and shows loading icon', function (done) {
               injector
                    .mock('mobileSlider', mobileSliderMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/audio'], function (audio) {
                        var playerButton = document.createElement('div'),
                            loadingIcon = document.createElement('div');

                        playerButton.classList.add('audio-player__button');
                        playerButton.style.display = 'block';

                        loadingIcon.classList.add('audio-player__button--loading');

                        container.appendChild(playerButton);
                        container.appendChild(loadingIcon);

                        audio.init();

                        window.audioLoad();

                        expect(playerButton.style.display).not.to.eql('block');
                        expect(loadingIcon.style.display).to.eql('block');

                        done();
                    });
            });
        });

        describe('window.audioFinishLoad()', function () {
            it('hides loading icon and shows audio player button', function (done) {
               injector
                    .mock('mobileSlider', mobileSliderMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/audio'], function (audio) {
                        var playerButton = document.createElement('div'),
                            loadingIcon = document.createElement('div');

                        playerButton.classList.add('audio-player__button');
                        playerButton.style.display = 'none';

                        loadingIcon.classList.add('audio-player__button--loading');
                        loadingIcon.style.display = 'block';

                        container.appendChild(playerButton);
                        container.appendChild(loadingIcon);

                        audio.init();

                        window.audioFinishLoad();

                        expect(playerButton.style.display).not.to.eql('none');
                        expect(loadingIcon.style.display).not.to.eql('block');

                        done();
                    });
            });
        });

        describe('window.audioBackground(duration)', function () {
            it('removes cutout background and adds new background', function (done) {
                injector
                    .mock('mobileSlider', mobileSliderMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/audio'], function (audio) {
                        var newCutoutBackground,
                            cutoutBackground = document.createElement('canvas'),
                            cutoutContainer = document.createElement('div');

                        container.classList.add('article__header');

                        cutoutBackground.classList.add('cutout__background');

                        container.appendChild(cutoutBackground);

                        cutoutContainer.classList.add('cutout__container');

                        container.appendChild(cutoutContainer);

                        audio.init();

                        window.audioBackground(1000);

                        newCutoutBackground = document.querySelector('.cutout__background');

                        expect(cutoutBackground.parentNode).to.be.falsy;
                        expect(cutoutBackground === newCutoutBackground).to.eql(false);
                        expect(newCutoutBackground.height).to.eql(300);
                        expect(newCutoutBackground.width).to.eql(500);
                        expect(newCutoutBackground.getContext('2d').fillStyle).to.eql('rgba(167, 216, 242, 0.09803921568627451)');
                        expect(cutoutContainer.dataset.background).to.eql('true');

                        done();
                    });
            });
        });

        describe('window.superAudioSlider(current, duration, platform)', function () {
            var current, 
                duration, 
                platform,
                resizeHandler;

            beforeEach(function () {
                current = 0;
                duration = 60000;
                platform = 'iOS';
                container.innerHTML = '<div class="audio-player__slider"> <input type="text" class="audio-player__slider__played" id="audio-scrubber" disabled=""> <input type="text" class="audio-player__slider__remaining" id="audio-scrubber-left" disabled=""> <div class="audio-player__slider__track"></div><div class="audio-player__slider__knob" role="slider" id="audio-slider-knob"></div></div>';
                sandbox.stub(window, 'addEventListener', function (event, handler) {
                    if (event === 'resize') {
                        resizeHandler = handler;
                    }
                });
            });

            it('does nothing if on iOS and slider is down', function (done) {
                injector
                    .mock('mobileSlider', mobileSliderMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/audio'], function (audio) {
                        var touchendEvt = document.createEvent('HTMLEvents'),
                            touchstartEvt = document.createEvent('HTMLEvents');

                        audio.init();

                        touchstartEvt.initEvent('touchstart', true, true);
                        document.body.dispatchEvent(touchstartEvt);

                        window.superAudioSlider(current, duration, platform);

                        touchendEvt.initEvent('touchend', true, true);
                        document.body.dispatchEvent(touchendEvt);

                        expect(mobileSliderMock).not.to.have.been.called;
                        
                        done();
                    });
            });

            it('if not iOS and background has not been set then style audio background', function (done) {
                injector
                    .mock('mobileSlider', mobileSliderMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/audio'], function (audio) {
                        platform = 'Android';

                        audio.init();

                        window.audioBackground = sinon.spy();

                        window.superAudioSlider(current, duration, platform);

                        expect(window.audioBackground).to.have.been.calledOnce;
                        expect(window.audioBackground).to.have.been.calledWith(duration);
                        expect(window.addEventListener).to.have.been.calledOnce;
                        expect(mobileSliderMock).to.have.been.calledOnce;

                        done();
                    });
            });

            it('if not iOS resize audio background on document resize', function (done) {
                injector
                    .mock('mobileSlider', mobileSliderMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/audio'], function (audio) {
                        platform = 'Android';

                        audio.init();

                        window.audioBackground = sinon.spy();

                        window.superAudioSlider(current, duration, platform);

                        resizeHandler();

                        expect(window.audioBackground).to.have.been.calledTwice;
                        expect(window.audioBackground).to.have.been.calledWith(duration);

                        done();
                    });
            });

            describe('change slider', function() {
                var changeSlider;

                beforeEach(function () {
                    mobileSliderMock = function(selector, opts) {
                        changeSlider = opts.change;
                    };
                });
                
                it('updates values of seconds played and remaining on slider changed', function (done) {
                    injector
                        .mock('mobileSlider', mobileSliderMock)
                        .mock('modules/util', utilMock)
                        .require(['ArticleTemplates/assets/js/bootstraps/audio'], function (audio) {
                            platform = 'Android';

                            audio.init();

                            window.audioBackground = sinon.spy();

                            window.superAudioSlider(current, duration, platform);

                            changeSlider(30000);

                            expect(document.querySelector('.audio-player__slider__played').value).to.eql('500:00');
                            expect(document.querySelector('.audio-player__slider__remaining').value).to.eql('-500:00');

                            done();
                        });
                });
            });
        });

        describe('window.updateSlider(current, platform)', function () {
            var current, 
                duration, 
                platform,
                dummySlider;

            beforeEach(function () {
                current = 20000;
                duration = 60000;
                platform = 'iOS';
                dummySlider = {
                    setValue: sinon.spy()
                };
                mobileSliderMock = function() {
                    return dummySlider;
                };
            });

            it('does nothing if on iOS and slider is down', function (done) {
                injector
                    .mock('mobileSlider', mobileSliderMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/audio'], function (audio) {
                        var touchendEvt = document.createEvent('HTMLEvents'),
                            touchstartEvt = document.createEvent('HTMLEvents');

                        audio.init();

                        window.superAudioSlider(current, duration, platform);

                        touchstartEvt.initEvent('touchstart', true, true);
                        document.body.dispatchEvent(touchstartEvt);

                        window.updateSlider(current, platform);

                        expect(dummySlider.setValue).not.to.have.been.called;

                        touchendEvt.initEvent('touchend', true, true);
                        document.body.dispatchEvent(touchendEvt);
                        
                        done();
                    });
            });

            it('does nothing if on iOS and slider is down', function (done) {
                injector
                    .mock('mobileSlider', mobileSliderMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/audio'], function (audio) {
                        audio.init();

                        window.superAudioSlider(current, duration, platform);

                        window.updateSlider(current, platform);

                        expect(dummySlider.setValue).to.have.been.calledOnce;
                        expect(dummySlider.setValue).to.have.been.calledWith(20000);

                        done();
                    });
            });
        });
    });
});