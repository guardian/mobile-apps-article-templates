jest.mock('modules/util', () => ({
    append: jest.fn(),
    signalDevice: jest.fn()
}));

import * as youtube from 'modules/youtube';
import * as util from 'modules/util'
import { signalDevice, append } from 'modules/util';

describe('ArticleTemplates/assets/js/modules/youtube', function () {
    let container;
    let scriptAdded;
    let ytPlayer;
    let getVideoWrapper = function (id) {
        var videoWrapper = document.createElement('div'),
            placeholder = document.createElement('div'),
            img = document.createElement('div'),
            touchpoint = document.createElement('div'),
            iframe = document.createElement('iframe');

        placeholder.classList.add('youtube-media__placeholder');
        touchpoint.classList.add('youtube-media__touchpoint');
        img.classList.add('youtube-media__placeholder__img');
        img.setAttribute('style', 'background-image: url(xxx)');
        placeholder.appendChild(touchpoint);
        placeholder.appendChild(img);

        iframe.classList.add('youtube-media');
        iframe.id = id;

        videoWrapper.appendChild(placeholder);
        videoWrapper.appendChild(iframe);

        return videoWrapper;
    };
    
    let setPlayerState = function (state, player) {
        Object.keys(window.YT.PlayerState).forEach(function (key) {
            if (key === state) {
                window.YT.PlayerState[key] = 1;
            } else {
                window.YT.PlayerState[key] = 0;
            }
        });

        player.onStateChange({
            data: 1
        });
    };

    let startVideoWithTap = function (videoWrapper, player, nativeYoutubeEnabled) {
        var event = document.createEvent('HTMLEvents'),
            touchpoint = videoWrapper.querySelector('.youtube-media__touchpoint');

        if (nativeYoutubeEnabled) {
            // dispatch click which stats video and start time
            event.initEvent('click', true, true);
            touchpoint.dispatchEvent(event);  
        } else {
            player.startTime = new Date();
            setPlayerState('PLAYING', player);
        }
    };

    function Player(id, options) {
        window.YT.players.push({
            onReady: options.events.onReady,
            onStateChange: options.events.onStateChange
        });
    }

    Player.prototype = {
        getDuration: function () {},
        getCurrentTime: function () {},
        pauseVideo: function () {}
    };

    beforeEach(function () {
        scriptAdded = false;
        container = document.createElement('div');
        container.id = 'container';
        document.body.appendChild(container);

        window.GU = {
            opts: {
                platform: 'ios'
            }
        };
        
        window.YT = {
            players: ytPlayer ? [ytPlayer] : [],
            PlayerState: {
                'ENDED': 0,
                'PLAYING': 0,
                'PAUSED': 0,
                'BUFFERING': 0,
                'CUED': 0
            },
            Player: Player
        };
    
        window.GuardianJSInterface = {
            trackAction: jest.fn()
        };

        jest.spyOn(Player.prototype, 'getDuration').mockImplementation(() => 20000);

        jest.spyOn(Player.prototype, 'getCurrentTime').mockImplementation(() => {
            var currentTime = new Date();

            if (this.startTime) {
                return currentTime - this.startTime;
            } else {
                this.startTime = currentTime;
            }

            return 0;
        });

        jest.spyOn(Player.prototype, 'pauseVideo');

        signalDevice.mockImplementation(() => jest.fn());
    });

    afterEach(function () {
        var youtubeScript = document.getElementById('youtube-script');

        if (youtubeScript) {
            youtubeScript.parentNode.removeChild(youtubeScript);
        }

        document.body.removeChild(container);

        delete window.GU;
        delete window.YT;
        delete window.onYouTubeIframeAPIReady;
        delete window.GuardianJSInterface;
    });

    it('does not add youtube script if no youtube iframe on page', function () {
        youtube.init();
        expect(scriptAdded).toEqual(false);
    });

    it('sets up iframe players when script ready', function () {
        append.mockImplementation((scriptElement) => {
            if (scriptElement.id === 'youtube-script') {
                scriptAdded = true;
                scriptElement.onload();
                window.onYouTubeIframeAPIReady();
            }
        });
        container.appendChild(getVideoWrapper('video1'));
        youtube.init();
        ytPlayer = window.YT.players[0];
        expect(scriptAdded).toEqual(true);
    });

    it('does not add youtube script if youtube script already on page', function () {
        container.innerHTML = '<script id="youtube-script" src=""></script>';
        container.appendChild(getVideoWrapper('video1'));

        youtube.init();
        expect(scriptAdded).toEqual(false);
    });

    it('sets up new player', function () {
        container.appendChild(getVideoWrapper('video1'));
        youtube.init();
        expect(window.YT.players.length).toEqual(1);
    });

    it('lays native video on touchpoint click if nativeYoutubeEnabled is true', function () {
        var videoWrapper = getVideoWrapper('video1');

        container.appendChild(videoWrapper);

        window.GU.opts.nativeYoutubeEnabled = true;

        youtube.init();

        window.YT.players[0].onReady('video1');
        startVideoWithTap(videoWrapper, window.YT.players[0], true);

        expect(videoWrapper.classList.contains('show-video')).toEqual(false);
        expect(videoWrapper.classList.contains('hide-placeholder')).toEqual(false);
    });

    it('initialiseVideos if scriptReady when checkForVideos called', function () {
        var videoWrapper1 = getVideoWrapper('video1'),
            videoWrapper2 = getVideoWrapper('video2');

        container.appendChild(videoWrapper1);

        youtube.init();

        expect(window.YT.players.length).toEqual(1);

        container.appendChild(videoWrapper2);

        youtube.checkForVideos();

        expect(window.YT.players.length).toEqual(2);
    });

    describe('on iOS', function () {
        it('handles onPlayerStateChange when PLAYING from start', function () {
            var videoWrapper = getVideoWrapper('video1');

            container.appendChild(videoWrapper);

            youtube.init();

            // Play Video
            window.YT.players[0].onReady('video1');
            setPlayerState('PLAYING', window.YT.players[0]);

            const signalDeviceMock = jest.spyOn(util, 'signalDevice');

            expect(signalDeviceMock).toHaveBeenCalledTimes(1);
            expect(signalDeviceMock).toHaveBeenCalledWith('youtube/' + JSON.stringify({id:'video1', eventType:'video:content:start'}));
        });

        it('handles onPlayerStateChange when PLAYING from PAUSED position', function () {
            var videoWrapper = getVideoWrapper('video1');

            container.appendChild(videoWrapper);

            youtube.init();

            // Play Video
            window.YT.players[0].onReady('video1');
            setPlayerState('PLAYING', window.YT.players[0]);

            // Pause Video
            setPlayerState('PAUSED', window.YT.players[0]);

            // Restart Video
            setPlayerState('PLAYING', window.YT.players[0]);

            const signalDeviceMock = jest.spyOn(util, 'signalDevice');
            expect(signalDeviceMock).toHaveBeenCalledTimes(1);
            expect(signalDeviceMock).toHaveBeenCalledWith('youtube/' + JSON.stringify({id:'video1', eventType:'video:content:start'}));

            // End video to kill progress tracker
            setPlayerState('ENDED', window.YT.players[0]);
        });

        it('handles onPlayerStateChange and tracks progress', function () {
            var videoWrapper = getVideoWrapper('video1');

            container.appendChild(videoWrapper);

            youtube.init();

            // Play Video
            window.YT.players[0].onReady('video1');
            setPlayerState('PLAYING', window.YT.players[0]);

            const signalDeviceMock = jest.spyOn(util, 'signalDevice');
            expect(signalDeviceMock).toHaveBeenCalledWith('youtube/' + JSON.stringify({id:'video1', eventType:'video:content:start'}));

            // End video to kill progress tracker
            setPlayerState('ENDED', window.YT.players[0]);
        });

        it('pauses video when other video begins and track new video', function () {
            var videoWrapper1 = getVideoWrapper('video1'),
                videoWrapper2 = getVideoWrapper('video2');

            container.appendChild(videoWrapper1);
            container.appendChild(videoWrapper2);

            youtube.init();

            // Play Video1
            window.YT.players[0].onReady('video1');
            setPlayerState('PLAYING', window.YT.players[0]);

            setPlayerState('ENDED', window.YT.players[0]);

            const signalDeviceMock = jest.spyOn(util, 'signalDevice');
            expect(signalDeviceMock).toHaveBeenCalledWith('youtube/' + JSON.stringify({id:'video1', eventType:'video:content:start'}));
            expect(signalDeviceMock).toHaveBeenCalledWith('youtube/' + JSON.stringify({id:'video1', eventType:'video:content:end'}));
        });

        it('handles onPlayerStateChange when PAUSED', function () {
            var videoWrapper = getVideoWrapper('video1');

            container.appendChild(videoWrapper);

            youtube.init();

            // Play video
            window.YT.players[0].onReady('video1');
            setPlayerState('PLAYING', window.YT.players[0]);

            // Pause video
            setPlayerState('PAUSED', window.YT.players[0]);

            const signalDeviceMock = jest.spyOn(util, 'signalDevice');
            expect(signalDeviceMock).toHaveBeenCalledWith('youtube/' + JSON.stringify({id:'video1', eventType:'video:content:start'}));

            // End video to kill progress tracker
            setPlayerState('ENDED', window.YT.players[0]);
        });

        it('handles onPlayerStateChange when ENDED', function () {
            var videoWrapper = getVideoWrapper('video1');

            videoWrapper.classList.add('hide-placeholder');
            videoWrapper.classList.add('show-video');

            container.appendChild(videoWrapper);

            youtube.init();

            setPlayerState('ENDED', window.YT.players[0]);

            const signalDeviceMock = jest.spyOn(util, 'signalDevice');
            expect(signalDeviceMock).toHaveBeenCalled();
            expect(signalDeviceMock).toHaveBeenCalledWith('youtube/' + JSON.stringify({id:'video1', eventType:'video:content:end'}));
        });
    });

    describe('on Android', function () {
        beforeEach(function () {
            window.GU.opts.platform = 'android';
        });

        it('handles onPlayerStateChange when PLAYING from PAUSED position', function () {
            var videoWrapper = getVideoWrapper('video1');

            container.appendChild(videoWrapper);

            youtube.init();

            // Play Video
            window.YT.players[0].onReady('video1');
            setPlayerState('PLAYING', window.YT.players[0]);

            setPlayerState('PAUSED', window.YT.players[0]);

            // Restart Video
            setPlayerState('PLAYING', window.YT.players[0]);

            expect(window.GuardianJSInterface.trackAction).toHaveBeenCalled();
            expect(window.GuardianJSInterface.trackAction).toHaveBeenCalledWith('youtube', JSON.stringify({id:'video1', eventType:'video:content:start'}));

            // End video to kill progress tracker
            setPlayerState('ENDED', window.YT.players[0]);
        });

        it('handles onPlayerStateChange and tracks progress', function () {
            var videoWrapper = getVideoWrapper('video1');

            container.appendChild(videoWrapper);

            youtube.init();

            // Play Video
            window.YT.players[0].onReady('video1');
            setPlayerState('PLAYING', window.YT.players[0]);

            expect(window.GuardianJSInterface.trackAction).toHaveBeenCalled();
            expect(window.GuardianJSInterface.trackAction).toHaveBeenCalledWith('youtube', JSON.stringify({id:'video1', eventType:'video:content:start'}));

            // End video to kill progress tracker
            setPlayerState('ENDED', window.YT.players[0]);
        });

        it('pauses video when other video begins and track new video', function () {
            var videoWrapper1 = getVideoWrapper('video1'),
                videoWrapper2 = getVideoWrapper('video2');

            container.appendChild(videoWrapper1);
            container.appendChild(videoWrapper2);

            youtube.init();

            // Play Video1
            window.YT.players[0].onReady('video1');
            setPlayerState('PLAYING', window.YT.players[0]);

            // End video to kill progress tracker
            setPlayerState('ENDED', window.YT.players[0]);
            expect(Player.prototype.pauseVideo).toHaveBeenCalled();
        });

        it('handles onPlayerStateChange when PAUSED', function () {
            var videoWrapper = getVideoWrapper('video1');

            container.appendChild(videoWrapper);

            youtube.init();

            // Play Video
            window.YT.players[0].onReady('video1');
            setPlayerState('PLAYING', window.YT.players[0]);

            // Pause video
            setPlayerState('PAUSED', window.YT.players[0]);

            expect(window.GuardianJSInterface.trackAction).toHaveBeenCalled();
            expect(window.GuardianJSInterface.trackAction).toHaveBeenCalledWith('youtube', JSON.stringify({id:'video1', eventType:'video:content:start'}));

            // End video to kill progress tracker
            setPlayerState('ENDED', window.YT.players[0]);
        });

        it('handles onPlayerStateChange when ENDED', function () {
            var videoWrapper = getVideoWrapper('video1');

            videoWrapper.classList.add('hide-placeholder');
            videoWrapper.classList.add('show-video');

            container.appendChild(videoWrapper);

            youtube.init();

            setPlayerState('ENDED', window.YT.players[0]);

            expect(window.GuardianJSInterface.trackAction).toHaveBeenCalled();
            expect(window.GuardianJSInterface.trackAction).toHaveBeenCalledWith('youtube', JSON.stringify({id:'video1', eventType:'video:content:end'}));
        });
    });
});
