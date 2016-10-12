/*
 Module: youtube.js
 Description: handle youtube iframe embeds.
 */

define(function() {
    'use strict';

    var videos,
        players = {}, 
        scriptReady = false;

    function ready() {
        checkForVideos();
    };

    function checkForVideos() {
        videos = document.body.querySelectorAll('iframe.youtube-video');

        if (videos.length && !scriptReady) {
            loadScript();
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
        var i,
            video;

        scriptReady = true;

        for (i = 0; i < videos.length; i++) {
            video = videos[i];
            players[video.id] = {
                player: setupPlayer(video.id),
                iframe: video,
                placeholder: video.parentNode.getElementsByClassName('youtube-video__placeholder')[0]
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
            touchPoint = placeholder.getElementsByClassName('youtube-video__touchpoint')[0];

        placeholder.classList.add('show-touchpoint');
        touchPoint.addEventListener('click', playVideo.bind(null, id, placeholder));
    }

    function playVideo(id, placeholder) {
        players[id].player.playVideo();
        placeholder.classList.add('hide-placeholder');
    }

    function onPlayerStateChange(id, event) {
        ['ENDED', 'PLAYING', 'PAUSED', 'BUFFERING', 'CUED'].forEach(function(status) {
            if (event.data === window.YT.PlayerState[status]) {
                setPlayerStatusClass(id, status);

                if (status === 'PLAYING') {
                    stopPlayers(id);
                } else if (status === 'ENDED') {
                    players[id].placeholder.classList.remove('hide-placeholder');    
                }
            }
        });
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

    return {
        init: ready
    };
});