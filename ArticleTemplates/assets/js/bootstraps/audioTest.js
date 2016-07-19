define([
    'squire'
], function(
    Squire
) {
    'use strict';

    describe.only('ArticleTemplates/assets/js/bootstraps/audio', function() {
        var container,
            injector;
            
        beforeEach(function() {
            container = document.createElement('div');
            container.id = "container";
            document.body.appendChild(container);
            injector = new Squire();
            window.applyNativeFunctionCall = sinon.spy();
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
        });

        describe('init()', function () {
            it('sets up global functions', function (done) {
               injector
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
                    .require(['ArticleTemplates/assets/js/bootstraps/audio'], function (audio) {
                        var playerButton = document.createElement('div'),
                            touchPointButton = document.createElement('div');

                        playerButton.classList.add('audio-player__button');
                        touchPointButton.classList.add('touchpoint__button');

                        playerButton.appendChild(touchPointButton);
                        container.appendChild(playerButton);

                        audio.init();

                        window.audioPlay();

                        expect(touchPointButton.dataset.icon).to.eql('');
                        expect(touchPointButton.classList.contains('pause')).to.eql(true);
                        expect(touchPointButton.classList.contains('play')).to.eql(false);

                        done();
                    });
            });
        });

        describe('window.audioStop()', function () {
            it('updates touchPointButton', function (done) {
               injector
                    .require(['ArticleTemplates/assets/js/bootstraps/audio'], function (audio) {
                        var playerButton = document.createElement('div'),
                            touchPointButton = document.createElement('div');

                        playerButton.classList.add('audio-player__button');
                        touchPointButton.classList.add('touchpoint__button');

                        playerButton.appendChild(touchPointButton);
                        container.appendChild(playerButton);

                        audio.init();

                        window.audioStop();

                        expect(touchPointButton.dataset.icon).to.eql('');
                        expect(touchPointButton.classList.contains('pause')).to.eql(false);
                        expect(touchPointButton.classList.contains('play')).to.eql(true);

                        done();
                    });
            });
        });

        describe('window.audioLoad()', function () {
            it('hides audio player button and shows loading icon', function (done) {
               injector
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
                    .require(['ArticleTemplates/assets/js/bootstraps/audio'], function (audio) {
                        var newCutoutBackground,
                            cutoutBackground = document.createElement('canvas'),
                            cutoutContainer = document.createElement('div');

                        container.classList.add('article__header');

                        cutoutBackground.classList.add('cutout__background');

                        container.appendChild(cutoutBackground);

                        cutoutContainer.classList.add('cutout__container');
                        cutoutContainer.style.height = '300px';
                        cutoutContainer.style.width = '500px';

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
                platform

            beforeEach(function () {
                current = 0;
                duration = 1000;
                platform = "iOS";
            });

            it('does nothing if on iOS and slider is down', function (done) {
                injector
                    .require(['ArticleTemplates/assets/js/bootstraps/audio'], function (audio) {
                        audio.init();

                        window.superAudioSlider(current, duration, platform)

                        done();
                    });
            });
        });
    });
});