/*
 Module: youtube.js
 Description: handle youtube iframe embeds.
 */

define(function() {
    'use strict';

    var videos,
        players = {},
        progressTracker = {}, 
        scriptReady = false;


    var STATES = {
        'ENDED': onPlayerEnded, 
        'PLAYING': onPlayerPlaying, 
        'PAUSED': onPlayerPaused, 
        'BUFFERING': null, 
        'CUED': null
    }; 

    function ready() {
        checkForVideos();
    }

    function setProgressTracker(id) {
        killProgressTracker(true);
        progressTracker.id = id;
        progressTracker.tracker = setInterval(recordPlayerProgress.bind(null, id), 1000);
    }

    function killProgressTracker(force, id) {
        if (progressTracker.tracker && 
            (force || id === progressTracker.id)) {
            clearInterval(progressTracker.tracker);
            progressTracker = {};
        }
    }

    function checkForVideos() {
        videos = document.body.querySelectorAll('iframe.youtube-media');

        if (videos.length) {
            if (!scriptReady) {
                loadScript();
            } else {
                initialiseVideos();
            }
        }
    }

    function loadScript() {
        var scriptElement;

        if (document.getElementById('youtube-script')) {
            return;
        }

        scriptElement = document.createElement('script');

        scriptElement.id = 'youtube-script';
        scriptElement.async = true;
        scriptElement.src = 'https://www.youtube.com/iframe_api';
        scriptElement.onload = onScriptLoaded;

        document.body.appendChild(scriptElement);
    }

    function onScriptLoaded() {
        window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }

    function onYouTubeIframeAPIReady() {
        scriptReady = true;
        initialiseVideos();
    }

    function initialiseVideos() {
        var i,
            video;

        for (i = 0; i < videos.length; i++) {
            video = videos[i];
            if (!players[video.id]) {
                players[video.id] = {
                    player: setupPlayer(video.id),
                    iframe: video,
                    placeholder: video.parentNode.getElementsByClassName('youtube-media__placeholder')[0]
                }
            }
        }
    }

    function setupPlayer(id) {
        var player = new YT.Player(id, {
            events: {
                onReady: onPlayerReady.bind(null, id),
                onStateChange: onPlayerStateChange.bind(null, id)
            }
        });

        return player;
    }

    function onPlayerReady(id) {
        var placeholder = players[id].placeholder,
            touchPoint = placeholder.getElementsByClassName('youtube-media__touchpoint')[0];

        players[id].duration = players[id].player.getDuration();

        console.log('*****************', id);

        placeholder.classList.add('show-touchpoint');
        touchPoint.addEventListener('click', playVideo.bind(null, id, placeholder));
    }

    function playVideo(id, placeholder) {
        players[id].player.playVideo();
        placeholder.classList.add('hide-placeholder');
    }

    function onPlayerStateChange(id, event) {
        Object.keys(STATES).forEach(checkState.bind(null, id, event.data));
    }

    function checkState(id, state, status) {
        if (state === window.YT.PlayerState[status]) {
            setPlayerStatusClass(id, status);

            if (STATES[status]) {
                STATES[status](id);
            }
        }
    }

    function onPlayerPlaying(id) {
        var currentTime = Math.round(players[id].player.getCurrentTime())

        stopPlayers(id);
        setProgressTracker(id);

        if (currentTime === 0) {
            console.log('*** track play', id);
        }
    }

    function onPlayerEnded(id) {
        killProgressTracker(false, id);
        players[id].placeholder.classList.remove('hide-placeholder');
        console.log('*** track end', id);
    }

    function onPlayerPaused(id) {
        killProgressTracker(false, id);
    }

    function stopPlayers(ignoreId) {
        Object.keys(players).forEach(stopPlayer.bind(null, ignoreId));
    }

    function stopPlayer(ignoreId, stopId) {
        if (ignoreId !== stopId) {
            players[stopId].player.pauseVideo();
        }
    }

    function setPlayerStatusClass(id, status) {
        var i,
            className = 'video-status-' + status.toLowerCase(),
            placeholder = players[id].placeholder;

        if (placeholder.classList.contains(className)) {
            return;
        }

        for (i = placeholder.classList.length; i > 0; i--) {
            if (placeholder.classList[i-1].indexOf('video-status-') !== -1) {
                placeholder.classList.remove(placeholder.classList[i-1]);
            }
        }

        placeholder.classList.add(className);
    }

    function recordPlayerProgress(id) {
        var currentTime = players[id].player.getCurrentTime(),
            percentPlayed = Math.round(((currentTime / players[id].duration) * 100));

        if (percentPlayed > 0 && 
            percentPlayed % 25 === 0) {
            console.log('*** track progress', percentPlayed, id);
        }
    }

    return {
        init: ready,
        checkForVideos: checkForVideos
    };
});