import { getElementOffset, debounce, signalDevice } from 'modules/util';

let audioCurrent;
let down;
let slider1;
let previous = 0;

function getColor() {
    const isAudio = !document.body.classList.contains('tone--podcast') && document.body.classList.contains('article--audio');
    return GU.opts.isAdvertising ? 'rgba(105, 209, 202, 0.15)' : (isAudio ? 'rgba(255, 187, 0, 0.05)' : 'rgba(167, 216, 242, 0.10)');
}

function secondsTimeSpanToHMS(s) {
    const m = Math.floor(s / 60);
    s -= m * 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
}

function superAudioSlider(current, duration, platform) {
    let audioPlayerSliderKnob;
    const cutoutContainer = document.getElementsByClassName('cutout__container')[0];

    if (platform === 'iOS') {
        if (down === 1) {
            return;
        }
    } else if ((!cutoutContainer || !cutoutContainer.dataset.background) && !document.body.classList.contains('media')) {
        window.audioBackground(duration);

        window.addEventListener('resize', debounce(() => {
            window.audioBackground(duration);
        }, 100));
    }

    audioPlayerSliderKnob = document.getElementsByClassName('audio-player__slider__knob')[0];

    if (audioPlayerSliderKnob) {
        audioPlayerSliderKnob.removeAttribute('style');
    }

    slider1 = new MobileRangeSlider(document.querySelector('.audio-player__slider'), {
        value: current,
        min: 0,
        max: duration,
        change: changeSlider.bind(null, duration)
    });
}

function changeSlider(duration, percentage) {
    const audioPlayerSliderPlayed = document.getElementsByClassName('audio-player__slider__played')[0];
    const audioPlayerSliderRemaining = document.getElementsByClassName('audio-player__slider__remaining')[0];

    audioCurrent = percentage;

    if (audioPlayerSliderPlayed) {
        audioPlayerSliderPlayed.value = secondsTimeSpanToHMS(percentage);
    }

    if (audioPlayerSliderRemaining) {
        const remaining = secondsTimeSpanToHMS(duration - percentage);
        audioPlayerSliderRemaining.value = percentage ? `-${remaining}` : `${remaining}`;
    }
}

function updateSlider(current, platform) {
    if (platform === 'iOS') {
        if (down === 1) {
            return;
        }
    }
    slider1.setValue(current);
    if (current - previous === 1) {
        audioPlaying();
    } else if (current === previous) {
        audioStop();
    }
    previous = current;
}

function audioSlider() {
    document.addEventListener('touchstart', () => {
        down = 1;
    }, false);

    document.addEventListener('touchend', () => {
        down = 0;
    }, false);

    /* Caution: Hot Mess */
    MobileRangeSlider.prototype.start = function () {
        if (GU.opts.platform === 'android') {
            window.GuardianJSInterface.registerRelatedCardsTouch(true);
        }

        this.addEvents('move');
        this.addEvents('end');
        this.handle(event);
    };

    /* Caution: Hot Mess */
    MobileRangeSlider.prototype.end = function () {
        if (GU.opts.platform === 'android') {
            window.GuardianJSInterface.registerRelatedCardsTouch(false);
        }

        this.removeEvents('move');
        this.removeEvents('end');

        signalDevice(`setPlayerTime/${audioCurrent}`);
    };
}

function audioPlay() {
    const audioPlayer = document.getElementsByClassName('audio-player')[0];

     if (audioPlayer) {
        audioPlayer.classList.add('loading');
    }
}

function audioPlaying() {
    const button = document.getElementsByClassName('audio-player__button')[0];
    const audioPlayer = document.getElementsByClassName('audio-player')[0];
    const screenReadable = document.getElementsByClassName('audio-player-readable')[0];

    if (button && audioPlayer && screenReadable) {
        button.classList.add('pause');
        audioPlayer.classList.remove('loading');
        screenReadable.innerHTML = "Pause";
    }
}

function audioStop() {
    const button = document.getElementsByClassName('audio-player__button')[0];
    const screenReadable = document.getElementsByClassName('audio-player-readable')[0];

    if (button && screenReadable) {
        button.classList.remove('pause');
        screenReadable.innerHTML = "Play";
    }
}

function audioLoad() {
    const audioPlayer = document.getElementsByClassName('audio-player')[0];
    audioPlayer.classList.add('loading');
}

function audioFinishLoad() {
    var audioPlayer = document.getElementsByClassName('audio-player')[0];
    audioPlayer.classList.remove('loading');
}

function audioBackground(duration) {
    const cutoutBackground = document.getElementsByClassName('cutout__background')[0];
    const cutoutContainer = document.getElementsByClassName('cutout__container')[0];

    if (cutoutBackground) {
        cutoutBackground.parentNode.removeChild(cutoutBackground);
    }

    if (cutoutContainer) {
        styleCutoutContainer(duration, cutoutContainer);
    }
}

function styleCutoutContainer(duration, cutoutContainer) {
    const articleHeader = document.getElementsByClassName('article__header')[0];
    const numOfCircles = Math.min(10, Math.floor((duration / 60) / 2)) + 2;
    const h = getElementOffset(cutoutContainer).height;
    const w = getElementOffset(cutoutContainer).width;
    let size = (h * w) / 8000;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = w;
    canvas.height = h;
    canvas.className = 'cutout__background';

    // Draw Circles
    for (let i = 0; i < numOfCircles; i++) {
        const x = Math.floor(Math.random() * (w - 0) + 1);
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

/**
 * Hide the existing podcast controls and adjust the height they take up
 * so they can be replaced by native controls.
 * When called returns (and sends via signalDevice) the relative position and size of the player container area
 * By relative this means relative to the top left corner of the page, it does not change as page is scrolled.
 * @param {number} desiredHeight - Height of native player that will replace this player
 * @returns {object} elementOffset - { top, left, height, width } (object can be null if container not found)
 */
function hidePodcastPlayer(desiredHeight) {
    const playerContainer = document.getElementsByClassName('audio-player__container')[0];
    if (playerContainer) {
        if (desiredHeight > 0) {
            playerContainer.style.opacity = 0;
            playerContainer.style.height = desiredHeight + 'px';
        } else {
            playerContainer.style.display = 'none';
        }
        const offset = getElementOffset(playerContainer);
        signalDevice(JSON.stringify(offset));
        return offset;
    }
    return null;
}

function showNewAudioPlayer() {
    const playerContainer = document.getElementsByClassName('audio-player__container')[0];
    if (playerContainer) {
        playerContainer.style.display = 'none';
    }

    const playerContainerNew = document.getElementsByClassName('audio-player__container_new')[0];
    if (playerContainerNew) {
        playerContainerNew.style.display = 'block';
    }
}

function setAudioDuration(duration) {
    const audioDuration = document.getElementsByClassName('audio-player__info__duration')[0];
    if (audioDuration) {
        audioDuration.textContent = duration;
    }
}

function newAudioPlayerLoading() {
    const newAudioPlayerContainer = document.getElementsByClassName('audio-player__container_new')[0];
    if (newAudioPlayerContainer) {
        const audioPlayer = newAudioPlayerContainer.getElementsByClassName('audio-player')[0];
        if (audioPlayer) {
            audioPlayer.classList.add('loading');
        }
    }
}

function newAudioPlayerPlaying() {
    const newAudioPlayerContainer = document.getElementsByClassName('audio-player__container_new')[0];
    if (newAudioPlayerContainer) {
        const button = newAudioPlayerContainer.getElementsByClassName('audio-player__button')[0];
        const audioPlayer = newAudioPlayerContainer.getElementsByClassName('audio-player')[0];
        const screenReadable = newAudioPlayerContainer.getElementsByClassName('audio-player-readable')[0];

        if (button && audioPlayer && screenReadable) {
            const href = button.getAttribute('href');
            button.setAttribute('href', href.replace(/x-gu:\/\/(playaudio|pauseaudio)\/(.*)/, 'x-gu://pauseaudio/$2'));
            button.classList.add('pause');
            audioPlayer.classList.remove('loading');
            screenReadable.innerHTML = 'Pause';
        }
    }
}

function newAudioPlayerStopped() {
    const newAudioPlayerContainer = document.getElementsByClassName('audio-player__container_new')[0];
    if (newAudioPlayerContainer) {
        const button = newAudioPlayerContainer.getElementsByClassName('audio-player__button')[0];
        const audioPlayer = newAudioPlayerContainer.getElementsByClassName('audio-player')[0];
        const screenReadable = newAudioPlayerContainer.getElementsByClassName('audio-player-readable')[0];

        if (button && audioPlayer && screenReadable) {
            const href = button.getAttribute('href');
            button.setAttribute('href', href.replace(/x-gu:\/\/(playaudio|pauseaudio)\/(.*)/, 'x-gu://playaudio/$2'));
            button.classList.remove('pause');
            audioPlayer.classList.remove('loading');
            screenReadable.innerHTML = "Play";
        }
    }
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
    window.hidePodcastPlayer = hidePodcastPlayer;
    window.showNewAudioPlayer = showNewAudioPlayer;
    window.setAudioDuration = setAudioDuration;
    window.newAudioPlayerLoading = newAudioPlayerLoading;
    window.newAudioPlayerPlaying = newAudioPlayerPlaying;
    window.newAudioPlayerStopped = newAudioPlayerStopped;

    window.applyNativeFunctionCall('audioBackground');
    window.applyNativeFunctionCall('superAudioSlider');
    window.applyNativeFunctionCall('audioPlay');
    window.applyNativeFunctionCall('audioStop');
}

function init() {
    audioSlider();
    setupGlobals();
}

export { init, changeSlider };
