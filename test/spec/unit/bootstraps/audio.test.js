import { init, changeSlider } from 'bootstraps/audio';

describe('ArticleTemplates/assets/js/bootstraps/audio', function () {
    let container;

    beforeEach(() => {
        window.MobileRangeSlider = jest.fn();
        window.applyNativeFunctionCall = jest.fn();
        window.GU = {
            opts: {
                isAdvertising: ''
            }
        };
        
        container = document.createElement('div');
        container.id = 'container';
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });
    
    describe('init()', function () {
        it('sets up global functions', function () {
            init();

            expect(window.audioPlay).toBeDefined();
            expect(window.audioStop).toBeDefined();
            expect(window.audioLoad).toBeDefined();
            expect(window.audioFinishLoad).toBeDefined();
            expect(window.audioBackground).toBeDefined();
            expect(window.superAudioSlider).toBeDefined();
            expect(window.updateSlider).toBeDefined();

            expect(window.applyNativeFunctionCall).toBeCalledWith('audioBackground');
            expect(window.applyNativeFunctionCall).toBeCalledWith('superAudioSlider');
            expect(window.applyNativeFunctionCall).toBeCalledWith('audioPlay');
            expect(window.applyNativeFunctionCall).toBeCalledWith('audioStop');
        });
    });

    describe('window.audioPlay()', function () {
        it('updates touchPointButton', function () {
            const playerButton = document.createElement('div');
            const screenReaderLabel = document.createElement('span');

            playerButton.classList.add('audio-player__button');
            screenReaderLabel.classList.add('audio-player-readable');

            container.appendChild(playerButton);
            container.appendChild(screenReaderLabel);

            init();

            window.audioPlay();

            expect(playerButton.classList.contains('pause')).toEqual(true);
        });
    });

    describe('window.audioStop()', function () {
        it('updates touchPointButton', function () {
            const playerButton = document.createElement('div');
            const screenReaderLabel = document.createElement('span');

            playerButton.classList.add('audio-player__button');
            screenReaderLabel.classList.add('audio-player-readable');

            container.appendChild(playerButton);
            container.appendChild(screenReaderLabel);

            init();

            window.audioStop();

            expect(playerButton.classList.contains('pause')).toEqual(false);
        });
    });

    describe('window.audioLoad()', function () {
        it('hides audio player button and shows loading icon', function () {
            let playerButton = document.createElement('div');
            let loadingIcon = document.createElement('div');

            playerButton.classList.add('audio-player__button');
            playerButton.style.display = 'block';

            loadingIcon.classList.add('audio-player__button--loading');

            container.appendChild(playerButton);
            container.appendChild(loadingIcon);

            init();

            window.audioLoad();
            
            expect(playerButton.style.display).not.toEqual('block');
            expect(loadingIcon.style.display).toEqual('block');
        });
    });

    describe('window.audioFinishLoad()', function () {
        it('hides loading icon and shows audio player button', function () {
            let playerButton = document.createElement('div');
            let loadingIcon = document.createElement('div');

            playerButton.classList.add('audio-player__button');
            playerButton.style.display = 'none';

            loadingIcon.classList.add('audio-player__button--loading');
            loadingIcon.style.display = 'block';

            container.appendChild(playerButton);
            container.appendChild(loadingIcon);

            init();

            window.audioFinishLoad();

            expect(playerButton.style.display).not.toEqual('none');
            expect(loadingIcon.style.display).not.toEqual('block');
        });
    });

    describe('window.audioBackground(duration)', function () {
        it('removes cutout background and adds new background', function () {
            let cutoutBackground = document.createElement('canvas');
            let cutoutContainer = document.createElement('div');

            container.classList.add('article__header');

            cutoutBackground.classList.add('cutout__background');

            container.appendChild(cutoutBackground);

            cutoutContainer.classList.add('cutout__container');

            container.appendChild(cutoutContainer);

            init();

            window.audioBackground(1000);

            expect(cutoutBackground.parentNode).toBeFalsy;
            expect(cutoutContainer.dataset.background).toEqual('true');
        });
    });

    describe('window.superAudioSlider(current, duration, platform)', function () {
        let current;
        let duration;
        let platform;
        let resizeHandler;

        beforeEach(function () {
            current = 0;
            duration = 60000;
            platform = 'iOS';
            container.innerHTML = '<div class="audio-player__slider"> <input type="text" class="audio-player__slider__played" id="audio-scrubber" disabled=""> <input type="text" class="audio-player__slider__remaining" id="audio-scrubber-left" disabled=""> <div class="audio-player__slider__track"></div><div class="audio-player__slider__knob" role="slider" id="audio-slider-knob"></div></div>';
            jest.spyOn(window, 'addEventListener')
                .mockImplementation((event, handler) => {
                    if (event === 'resize') {
                        resizeHandler = handler;
                    }
                });
        });

        it('if not iOS and background has not been set then style audio background', function () {
            platform = 'Android';

            init();

            window.audioBackground = jest.fn();

            window.superAudioSlider(current, duration, platform);

            expect(window.audioBackground).toBeCalledTimes(1);
            expect(window.audioBackground).toBeCalledWith(duration);
            expect(window.addEventListener).toBeCalledTimes(1);
        });

        it('if not iOS resize audio background on document resize', function () {
            platform = 'Android';

            init();

            window.audioBackground = jest.fn();

            window.superAudioSlider(current, duration, platform);

            resizeHandler();

            expect(window.audioBackground).toBeCalledWith(duration); 
        });

        it('updates values of seconds played and remaining on slider changed', function () {
            platform = 'Android';

            init();

            window.audioBackground = jest.fn();

            window.superAudioSlider(current, duration, platform);

            changeSlider(null, 30000);

            expect(document.querySelector('.audio-player__slider__played').value).toEqual('500:00');
        });
    });
});