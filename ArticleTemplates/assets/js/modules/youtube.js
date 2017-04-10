define([
    'modules/util'
], function(
    util
) {
    'use strict';

    var videos,
        stateHandlers = {},
        players = {},
        progressTracker = {},
        scriptReady = false;

    function ready() {
        setStateHandlers();
        checkForVideos();
    }

    function setStateHandlers() {
        if (!GU.opts.nativeYoutubeEnabled) {
            stateHandlers = {
                'ENDED': onPlayerEnded,
                'PLAYING': onPlayerPlaying,
                'PAUSED': onPlayerPaused
            };
        }
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
            placeholder,
            video;

        for (i = 0; i < videos.length; i++) {
            video = videos[i];
            placeholder = video.parentNode.getElementsByClassName('youtube-media__placeholder')[0];

            if (!players[video.id]) {
                players[video.id] = {
                    player: setupPlayer(video.id),
                    iframe: video,
                    pendingTrackingCalls: [25, 50, 75]
                };

                if (hasPlaceholderImgSrc(placeholder)) {
                    players[video.id].placeholder = placeholder; 
                } else {
                    placeholder.parentNode.removeChild(placeholder);
                }
            }
        }
    }

    function hasPlaceholderImgSrc(placeholder) {
        var img = placeholder.getElementsByClassName('youtube-media__placeholder__img')[0];

        return img.getAttribute('style') !== 'background-image: url()';
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
        var touchPoint;

        players[id].duration = players[id].player.getDuration();

        if (players[id].placeholder) {
            touchPoint = players[id].placeholder.getElementsByClassName('youtube-media__touchpoint')[0];
            
            if (!GU.opts.nativeYoutubeEnabled) {
                players[id].placeholder.classList.add('disable-pointer-events');
            } else {
                touchPoint.addEventListener('click', sendPlayEventForNativePlayer.bind(null, id));
            }
            
            players[id].placeholder.classList.add('fade-touchpoint');
        } else {
            players[id].iframe.parentNode.classList.add('show-video');
        }
    }

    function sendPlayEventForNativePlayer(id) {
        trackEvent({
            id: id,
            eventType: 'video:content:start'
        });
    }

    function hidePlaceholder(placeholderParent) {
        placeholderParent.classList.add('hide-placeholder');
    }

    function onPlayerStateChange(id, event) {
        Object.keys(stateHandlers).forEach(checkState.bind(null, id, event.data));
    }

    function checkState(id, state, stateHandler) {
        if (state === window.YT.PlayerState[stateHandler]) {
            stateHandlers[stateHandler](id);
        }
    }

    function onPlayerPlaying(id) {
        var placeholderParent,
            currentTime = Math.round(players[id].player.getCurrentTime());

        stopPlayers(id);
        setProgressTracker(id);

        if (currentTime === 0) {
            if (players[id].placeholder) {
                placeholderParent = players[id].placeholder.parentNode;
                placeholderParent.classList.add('show-video');
                setTimeout(hidePlaceholder.bind(null, placeholderParent), 300);
            }

            trackEvent({
                id: id,
                eventType: 'video:content:start'
            });
        }
    }

    function onPlayerEnded(id) {
        var placeholderParent; 

        if (players[id].placeholder) {
            placeholderParent = players[id].placeholder.parentNode;
            placeholderParent.classList.remove('hide-placeholder');
            setTimeout(showPlaceholder.bind(null, placeholderParent), 1000);
        }

        killProgressTracker(false, id);

        trackEvent({
            id: id,
            eventType: 'video:content:end'
        });

        players[id].pendingTrackingCalls = [25, 50, 75];
    }

    function showPlaceholder(placeholderParent) {
        placeholderParent.classList.remove('show-video');
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

    function recordPlayerProgress(id) {
        var currentTime,
            percentPlayed,
            pendingTrackingCalls = players[id].pendingTrackingCalls;

        if (!pendingTrackingCalls.length) {
            return;
        }

        currentTime = players[id].player.getCurrentTime();
        percentPlayed = Math.round(((currentTime / players[id].duration) * 100));

        if (percentPlayed >= pendingTrackingCalls[0]) {

            trackEvent({
                id: id,
                eventType: 'video:content:' + pendingTrackingCalls[0]
            });

            pendingTrackingCalls.shift();
        }
    }

    function trackEvent(evt) {
        if (GU.opts.platform === 'android' &&
            window.GuardianJSInterface &&
            window.GuardianJSInterface.trackAction) {
            window.GuardianJSInterface.trackAction('youtube', JSON.stringify(evt));
        } else {
            util.signalDevice('youtube/' + JSON.stringify(evt));
        }
    }

    return {
        init: ready,
        checkForVideos: checkForVideos
    };
});
