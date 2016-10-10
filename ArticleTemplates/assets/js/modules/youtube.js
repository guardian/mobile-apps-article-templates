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
        videos = document.body.querySelectorAll('iframe.js-youtube-video');

        if (videos.length && !scriptReady) {
            loadScript();
        }
    }

    function loadScript() {
        var scriptElement;

        if (document.getElementById('youtube-player')) {
            return;
        }

        scriptElement = document.createElement('script');

        scriptElement.id = 'youtube-player';
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
            players[video.id] = setupPlayer(video);
        }
    }

    function setupPlayer(video) {
        var player = new YT.Player(video.id, {
            events: {
                onReady: onPlayerReady.bind(null, video),
                onStateChange: onPlayerStateChange.bind(null, video)
            }
        });

        return player;
    }

    function onPlayerReady(video, event) {
        console.log('*** READY', players[video.id]);
    }

    function onPlayerStateChange(video, event) {
        ['ENDED', 'PLAYING', 'PAUSED', 'BUFFERING', 'CUED'].forEach(function(status) {
            if (event.data === window.YT.PlayerState[status]) {
                console.log('*** ' + status, video);
            }
        });
    }

    return {
        init: ready
    };
});