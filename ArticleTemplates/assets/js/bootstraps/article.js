import { init as youtubeInit } from 'modules/youtube';
import { init as twitterInit } from 'modules/twitter';
import { init as quizInit } from 'modules/quiz';
import { init as immersiveInit } from 'modules/immersive';
import { init as numberedListInit } from 'modules/numberedList';
import { init as creativeInjectorInit } from 'modules/creativeInjector';
import { init as messengerInit } from 'modules/messenger';
import resizeInit from 'modules/messenger/resize';

function richLinkTracking() {
    let i;
    let j;
    let href;
    let link;
    let links;
    let richLink;
    const richLinks = document.getElementsByClassName('element-rich-link');

    for (i = 0; i < richLinks.length; i++) {
        richLink = richLinks[i];
        links = richLink.getElementsByTagName('a');

        for (j = 0; j < links.length; j++) {
            link = links[j];
            href = link.getAttribute('href');
            if (href !== '') {
                link.setAttribute('href', `${href}?ArticleReferrer=RichLink`);
            }
        }
    }
}

function showListenToArticlePlayer() {
    const playerContainer = document.getElementsByClassName('listen-to-article__container')[0];
    if (playerContainer) {
        playerContainer.style.display = 'block';
    }
}

function setAudioDuration(duration) {
    const audioDuration = document.getElementsByClassName('audio-player__info__duration')[0];
    if (audioDuration) {
        audioDuration.textContent = duration;
    }
}

function listenToArticlePlayerLoading() {
    const audioPlayerContainer = document.getElementsByClassName('listen-to-article__container')[0];
    if (audioPlayerContainer) {
        const audioPlayer = audioPlayerContainer.getElementsByClassName('audio-player')[0];
        if (audioPlayer) {
            audioPlayer.classList.add('loading');
        }
    }
}

function listenToArticlePlayerPlaying() {
    const audioPlayerContainer = document.getElementsByClassName('listen-to-article__container')[0];
    if (audioPlayerContainer) {
        const button = audioPlayerContainer.getElementsByClassName('audio-player__button')[0];
        const audioPlayer = audioPlayerContainer.getElementsByClassName('audio-player')[0];
        const screenReadable = audioPlayerContainer.getElementsByClassName('audio-player-readable')[0];

        if (button && audioPlayer && screenReadable) {
            const href = button.getAttribute('href');
            button.setAttribute('href', href.replace(/x-gu:\/\/(playaudio|pauseaudio)\/(.*)/, 'x-gu://pauseaudio/$2'));
            button.classList.add('pause');
            audioPlayer.classList.remove('loading');
            screenReadable.innerHTML = 'Pause';
        }
    }
}

function listenToArticlePlayerStopped() {
    const audioPlayerContainer = document.getElementsByClassName('listen-to-article__container')[0];
    if (audioPlayerContainer) {
        const button = audioPlayerContainer.getElementsByClassName('audio-player__button')[0];
        const audioPlayer = audioPlayerContainer.getElementsByClassName('audio-player')[0];
        const screenReadable = audioPlayerContainer.getElementsByClassName('audio-player-readable')[0];

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
    // Global function to handle listen-to-article UI, called by native code
    window.showListenToArticlePlayer = showListenToArticlePlayer;
    window.setAudioDuration = setAudioDuration;
    window.listenToArticlePlayerLoading = listenToArticlePlayerLoading;
    window.listenToArticlePlayerPlaying = listenToArticlePlayerPlaying;
    window.listenToArticlePlayerStopped = listenToArticlePlayerStopped;
}

function init() {
    youtubeInit();
    twitterInit();
    quizInit();
    immersiveInit();
    numberedListInit();
    creativeInjectorInit();
    messengerInit([resizeInit]);
    richLinkTracking();
    setupGlobals();
}

export { init };
