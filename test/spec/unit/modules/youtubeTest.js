define([
    'squire'
], function (
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/modules/youtube', function () {
        this.timeout(15000);

        var scriptAdded,
            sandbox,
            container,
            injector,
            getVideoWrapper = function(id) {
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
            },
            setPlayerState = function (state, player) {
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
            },
            startVideo = function (videoWrapper, player) {
                var event = document.createEvent('HTMLEvents'),
                    touchpoint = videoWrapper.querySelector('.youtube-media__touchpoint');

                // onReady sets up click event listener
                player.onReady('video1');
                // dispatch click which srats video and start time
                event.initEvent('click', true, true);
                touchpoint.dispatchEvent(event);
            };

        function Player(id, options) {
            window.YT.players.push({
                onReady: options.events.onReady,
                onStateChange: options.events.onStateChange
            });
        }

        Player.prototype = {
            playVideo: function () {},
            getDuration: function () {},
            getCurrentTime: function () {},
            pauseVideo: function () {}
        };

        beforeEach(function () {
            scriptAdded = false;

            container = document.createElement('div');
            container.id = 'container';
            document.body.appendChild(container);

            injector = new Squire();
            sandbox = sinon.sandbox.create();

            window.GU = {
                opts: {
                    platform: 'ios'
                },
                util: {
                    signalDevice: sinon.spy()
                }
            };

            window.YT = {
                players: [],
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
                trackAction: sinon.spy()
            };

            sandbox.stub(document.body, 'appendChild', function(scriptElement) {
                if (scriptElement.id === 'youtube-script') {
                    scriptAdded = true;
                    scriptElement.onload();
                    window.onYouTubeIframeAPIReady();
                }
            });

            sandbox.stub(Player.prototype, 'playVideo', function() {
                this.startTime = new Date();
            });

            sandbox.stub(Player.prototype, 'getDuration', function() {
                return 20000;
            });

            sandbox.stub(Player.prototype, 'getCurrentTime', function() {
                var currentTime = new Date();

                if (this.startTime) {
                    return currentTime - this.startTime;
                }

                return 0;
            });

            sandbox.spy(Player.prototype, 'pauseVideo');
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

            sandbox.restore();
        });

        it('does not add youtube script if no youtube iframe on page', function (done) {
            injector
                .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                    youtube.init();

                    expect(scriptAdded).to.eql(false);

                    done();
                });
        });

        it('sets up iframe players when script ready', function (done) {
            injector
                .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                    container.appendChild(getVideoWrapper('video1'));

                    youtube.init();

                    expect(scriptAdded).to.eql(true);

                    done();
                });
        });

        it('does not add youtube script if youtube script already on page', function (done) {
            injector
                .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                    container.innerHTML = '<script id="youtube-script" src=""></script>';
                    container.appendChild(getVideoWrapper('video1'));

                    youtube.init();

                    expect(scriptAdded).to.eql(false);

                    done();
                });
        });

        it('sets up new player', function (done) {
            injector
                .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                    container.appendChild(getVideoWrapper('video1'));

                    youtube.init();

                    expect(window.YT.players.length).to.eql(1);

                    done();
                });
        });

        it('removes placeholder if no placeholder image provided', function (done) {
            injector
                .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                    var videoWrapper = getVideoWrapper('video1'),
                        placeholder = videoWrapper.querySelector('.youtube-media__placeholder');

                    container.appendChild(videoWrapper);

                    videoWrapper.querySelector('.youtube-media__placeholder__img').setAttribute('style', 'background-image: url()');

                    youtube.init();

                    expect(placeholder.parentNode).to.be.falsy;

                    done();
                });
        });

        it('handles onPlayerReady', function (done) {
            injector
                .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                    var videoWrapper = getVideoWrapper('video1'),
                        placeholder = videoWrapper.querySelector('.youtube-media__placeholder');

                    container.appendChild(videoWrapper);

                    youtube.init();

                    window.YT.players[0].onReady('video1');

                    expect(Player.prototype.getDuration).to.have.been.calledOnce;
                    expect(placeholder.classList.contains('fade-touchpoint')).to.eql(true);

                    done();
                });
        });

        it('handles onPlayerReady if no placeholder image provided', function (done) {
            injector
                .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                    var videoWrapper = getVideoWrapper('video1'),
                        iframe = videoWrapper.querySelector('.youtube-media');

                    container.appendChild(videoWrapper);

                    videoWrapper.querySelector('.youtube-media__placeholder__img').setAttribute('style', 'background-image: url()');

                    youtube.init();

                    window.YT.players[0].onReady('video1');

                    expect(iframe.parentNode.classList.contains('show-video')).to.eql(true);

                    done();
                });
        });

        it('plays video on touchpoint click and hides placeholder', function (done) {
            injector
                .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                    var videoWrapper = getVideoWrapper('video1');

                    container.appendChild(videoWrapper);

                    youtube.init();

                    startVideo(videoWrapper, window.YT.players[0]);

                    setTimeout(function() {
                        expect(Player.prototype.playVideo).to.have.been.calledOnce;
                        expect(videoWrapper.classList.contains('show-video')).to.eql(true);
                        expect(videoWrapper.classList.contains('hide-placeholder')).to.eql(true);

                        done();
                    }, 500);
                });
        });

        it('plays native video on touchpoint click if nativeYoutubeEnabled is true', function (done) {
            injector
                .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                    var videoWrapper = getVideoWrapper('video1');

                    container.appendChild(videoWrapper);

                    window.GU.opts.nativeYoutubeEnabled = 'true';

                    youtube.init();

                    startVideo(videoWrapper, window.YT.players[0]);

                    setTimeout(function() {
                        expect(Player.prototype.playVideo).not.to.have.been.calledOnce;
                        expect(videoWrapper.classList.contains('show-video')).to.eql(false);
                        expect(videoWrapper.classList.contains('hide-placeholder')).to.eql(false);
                        expect(window.GU.util.signalDevice).to.have.been.calledWith('youtube/' + JSON.stringify({id:'video1', eventType:'video:content:start'}));

                        done();
                    }, 500);
                });
        });

        it('initialiseVideos if scriptReady when checkForVideos called', function (done) {
            injector
                .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                    var videoWrapper1 = getVideoWrapper('video1'),
                        videoWrapper2 = getVideoWrapper('video2');

                    container.appendChild(videoWrapper1);

                    youtube.init();

                    expect(window.YT.players.length).to.eql(1);

                    container.appendChild(videoWrapper2);

                    youtube.checkForVideos();

                    expect(window.YT.players.length).to.eql(2);

                    done();
                });
        });

        describe('on iOS', function() {
            it('handles onPlayerStateChange when PLAYING from start', function (done) {
                injector
                    .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                        var videoWrapper = getVideoWrapper('video1');

                        container.appendChild(videoWrapper);

                        youtube.init();

                        setPlayerState('PLAYING', window.YT.players[0]);

                        expect(Player.prototype.getCurrentTime).to.have.been.called;
                        expect(window.GU.util.signalDevice).to.have.been.calledOnce;
                        expect(window.GU.util.signalDevice).to.have.been.calledWith('youtube/' + JSON.stringify({id:'video1', eventType:'video:content:start'}));

                        done();
                    });
            });

            it('handles onPlayerStateChange when PLAYING from PAUSED position', function (done) {
                injector
                    .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                        var videoWrapper = getVideoWrapper('video1');

                        container.appendChild(videoWrapper);

                        youtube.init();

                        // Play Video
                        setPlayerState('PLAYING', window.YT.players[0]);
                        startVideo(videoWrapper, window.YT.players[0]);

                        setTimeout(function () {
                            // Pause Video
                            setPlayerState('PAUSED', window.YT.players[0]);

                            // Restart Video
                            setPlayerState('PLAYING', window.YT.players[0]);

                            expect(Player.prototype.getCurrentTime).to.have.been.called;
                            expect(window.GU.util.signalDevice).to.have.been.calledOnce;
                            expect(window.GU.util.signalDevice).to.have.been.calledWith('youtube/' + JSON.stringify({id:'video1', eventType:'video:content:start'}));

                            // End video to kill progress tracker
                            setPlayerState('ENDED', window.YT.players[0]);

                            done();
                        }, 500);
                    });
            });

            it('handles onPlayerStateChange and tracks progress', function (done) {
                injector
                    .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                        var videoWrapper = getVideoWrapper('video1');

                        container.appendChild(videoWrapper);

                        youtube.init();

                        // Play Video
                        setPlayerState('PLAYING', window.YT.players[0]);
                        startVideo(videoWrapper, window.YT.players[0]);

                        setTimeout(function() {
                            expect(Player.prototype.playVideo).to.have.been.calledOnce;
                            expect(window.GU.util.signalDevice).to.have.been.called;
                            expect(window.GU.util.signalDevice).to.have.been.calledWith('youtube/' + JSON.stringify({id:'video1', eventType:'video:content:start'}));
                            expect(window.GU.util.signalDevice).to.have.been.calledWith('youtube/' + JSON.stringify({id:'video1', eventType:'video:content:25'}));

                            // End video to kill progress tracker
                            setPlayerState('ENDED', window.YT.players[0]);

                            done();
                        }, 8000);
                    });
            });

            it('pauses video when other video begins and track new video', function (done) {
                injector
                    .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                        var videoWrapper1 = getVideoWrapper('video1'),
                            videoWrapper2 = getVideoWrapper('video2');

                        container.appendChild(videoWrapper1);
                        container.appendChild(videoWrapper2);

                        youtube.init();

                        // Play Video1
                        setPlayerState('PLAYING', window.YT.players[0]);
                        startVideo(videoWrapper1, window.YT.players[0]);

                        // Play Video2
                        setPlayerState('PLAYING', window.YT.players[1]);
                        startVideo(videoWrapper2, window.YT.players[1]);

                        setTimeout(function () {
                            // End video to kill progress tracker
                            setPlayerState('ENDED', window.YT.players[1]);

                            expect(window.GU.util.signalDevice).to.have.been.called;
                            expect(window.GU.util.signalDevice).to.have.been.calledWith('youtube/' + JSON.stringify({id:'video1', eventType:'video:content:start'}));
                            expect(window.GU.util.signalDevice).to.have.been.calledWith('youtube/' + JSON.stringify({id:'video2', eventType:'video:content:start'}));
                            expect(window.GU.util.signalDevice).to.have.been.calledWith('youtube/' + JSON.stringify({id:'video2', eventType:'video:content:25'}));
                            expect(window.YT.players.length).to.eql(2);
                            expect(Player.prototype.playVideo).to.have.been.calledTwice;
                            expect(Player.prototype.pauseVideo).to.have.been.calledTwice;

                            done();
                        }, 8000);
                    });
            });

            it('handles onPlayerStateChange when PAUSED', function (done) {
                injector
                    .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                        var videoWrapper = getVideoWrapper('video1');

                        container.appendChild(videoWrapper);

                        youtube.init();

                        // Play video
                        setPlayerState('PLAYING', window.YT.players[0]);
                        startVideo(videoWrapper, window.YT.players[0]);

                        // Pause video
                        setPlayerState('PAUSED', window.YT.players[0]);

                        setTimeout(function () {
                            expect(Player.prototype.playVideo).to.have.been.calledOnce;
                            expect(window.GU.util.signalDevice).to.have.been.calledOnce;
                            expect(window.GU.util.signalDevice).to.have.been.calledWith('youtube/' + JSON.stringify({id:'video1', eventType:'video:content:start'}));

                            // End video to kill progress tracker
                            setPlayerState('ENDED', window.YT.players[0]);

                            done();
                        }, 8000);
                    });
            });

            it('handles onPlayerStateChange when ENDED', function (done) {
                injector
                    .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                        var videoWrapper = getVideoWrapper('video1');

                        videoWrapper.classList.add('hide-placeholder');
                        videoWrapper.classList.add('show-video');

                        container.appendChild(videoWrapper);

                        youtube.init();

                        setPlayerState('ENDED', window.YT.players[0]);

                        setTimeout(function () {
                            expect(videoWrapper.classList.contains('hide-placeholder')).to.eql(false);
                            expect(videoWrapper.classList.contains('show-video')).to.eql(false);
                            expect(window.GU.util.signalDevice).to.have.been.calledOnce;
                            expect(window.GU.util.signalDevice).to.have.been.calledWith('youtube/' + JSON.stringify({id:'video1', eventType:'video:content:end'}));

                            done();
                        }, 1500);
                    });
            });
        });

        describe('on Android', function() {
            beforeEach(function () {
                window.GU.opts.platform = 'android';
            });

            it('does not handle onPlayerStateChange id GU.opts.nativeYoutubeEnabled is true', function(done) {
                injector
                    .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                        var videoWrapper = getVideoWrapper('video1');

                        container.appendChild(videoWrapper);

                        window.GU.opts.nativeYoutubeEnabled = 'true';

                        youtube.init();

                        setPlayerState('PLAYING', window.YT.players[0]);

                        expect(Player.prototype.getCurrentTime).not.to.have.been.called;
                        expect(window.GuardianJSInterface.trackAction).not.to.have.been.called;
                        
                        done();
                    });
            });

            it('handles onPlayerStateChange when PLAYING from start', function (done) {
                injector
                    .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                        var videoWrapper = getVideoWrapper('video1');

                        container.appendChild(videoWrapper);

                        youtube.init();

                        setPlayerState('PLAYING', window.YT.players[0]);

                        expect(Player.prototype.getCurrentTime).to.have.been.called;
                        expect(window.GuardianJSInterface.trackAction).to.have.been.calledOnce;
                        expect(window.GuardianJSInterface.trackAction).to.have.been.calledWith('youtube', JSON.stringify({id:'video1', eventType:'video:content:start'}));

                        done();
                    });
            });

            it('handles onPlayerStateChange when PLAYING from PAUSED position', function (done) {
                injector
                    .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                        var videoWrapper = getVideoWrapper('video1');

                        container.appendChild(videoWrapper);

                        youtube.init();

                        // Play Video
                        setPlayerState('PLAYING', window.YT.players[0]);
                        startVideo(videoWrapper, window.YT.players[0]);

                        setTimeout(function () {
                            // Pause Video
                            setPlayerState('PAUSED', window.YT.players[0]);

                            // Restart Video
                            setPlayerState('PLAYING', window.YT.players[0]);

                            expect(Player.prototype.getCurrentTime).to.have.been.called;
                            expect(window.GuardianJSInterface.trackAction).to.have.been.calledOnce;
                            expect(window.GuardianJSInterface.trackAction).to.have.been.calledWith('youtube', JSON.stringify({id:'video1', eventType:'video:content:start'}));

                            // End video to kill progress tracker
                            setPlayerState('ENDED', window.YT.players[0]);

                            done();
                        }, 500);
                    });
            });

            it('handles onPlayerStateChange and tracks progress', function (done) {
                injector
                    .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                        var videoWrapper = getVideoWrapper('video1');

                        container.appendChild(videoWrapper);

                        youtube.init();

                        // Play Video
                        setPlayerState('PLAYING', window.YT.players[0]);
                        startVideo(videoWrapper, window.YT.players[0]);

                        setTimeout(function() {
                            expect(Player.prototype.playVideo).to.have.been.calledOnce;
                            expect(window.GuardianJSInterface.trackAction).to.have.been.called;
                            expect(window.GuardianJSInterface.trackAction).to.have.been.calledWith('youtube', JSON.stringify({id:'video1', eventType:'video:content:start'}));
                            expect(window.GuardianJSInterface.trackAction).to.have.been.calledWith('youtube', JSON.stringify({id:'video1', eventType:'video:content:25'}));

                            // End video to kill progress tracker
                            setPlayerState('ENDED', window.YT.players[0]);

                            done();
                        }, 8000);
                    });
            });

            it('pauses video when other video begins and track new video', function (done) {
                injector
                    .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                        var videoWrapper1 = getVideoWrapper('video1'),
                            videoWrapper2 = getVideoWrapper('video2');

                        container.appendChild(videoWrapper1);
                        container.appendChild(videoWrapper2);

                        youtube.init();

                        // Play Video1
                        setPlayerState('PLAYING', window.YT.players[0]);
                        startVideo(videoWrapper1, window.YT.players[0]);

                        // Play Video2
                        setPlayerState('PLAYING', window.YT.players[1]);
                        startVideo(videoWrapper2, window.YT.players[1]);

                        setTimeout(function () {
                            // End video to kill progress tracker
                            setPlayerState('ENDED', window.YT.players[1]);

                            expect(window.GuardianJSInterface.trackAction).to.have.been.called;
                            expect(window.GuardianJSInterface.trackAction).to.have.been.calledWith('youtube', JSON.stringify({id:'video1', eventType:'video:content:start'}));
                            expect(window.GuardianJSInterface.trackAction).to.have.been.calledWith('youtube', JSON.stringify({id:'video2', eventType:'video:content:start'}));
                            expect(window.GuardianJSInterface.trackAction).to.have.been.calledWith('youtube', JSON.stringify({id:'video2', eventType:'video:content:25'}));
                            expect(window.YT.players.length).to.eql(2);
                            expect(Player.prototype.playVideo).to.have.been.calledTwice;
                            expect(Player.prototype.pauseVideo).to.have.been.calledTwice;

                            done();
                        }, 8000);
                    });
            });

            it('handles onPlayerStateChange when PAUSED', function (done) {
                injector
                    .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                        var videoWrapper = getVideoWrapper('video1');

                        container.appendChild(videoWrapper);

                        youtube.init();

                        // Play video
                        setPlayerState('PLAYING', window.YT.players[0]);
                        startVideo(videoWrapper, window.YT.players[0]);

                        // Pause video
                        setPlayerState('PAUSED', window.YT.players[0]);

                        setTimeout(function () {
                            expect(Player.prototype.playVideo).to.have.been.calledOnce;
                            expect(window.GuardianJSInterface.trackAction).to.have.been.calledOnce;
                            expect(window.GuardianJSInterface.trackAction).to.have.been.calledWith('youtube', JSON.stringify({id:'video1', eventType:'video:content:start'}));

                            // End video to kill progress tracker
                            setPlayerState('ENDED', window.YT.players[0]);

                            done();
                        }, 8000);
                    });
            });

            it('handles onPlayerStateChange when ENDED', function (done) {
                injector
                    .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                        var videoWrapper = getVideoWrapper('video1');

                        videoWrapper.classList.add('hide-placeholder');
                        videoWrapper.classList.add('show-video');

                        container.appendChild(videoWrapper);

                        youtube.init();

                        setPlayerState('ENDED', window.YT.players[0]);

                        setTimeout(function () {
                            expect(videoWrapper.classList.contains('hide-placeholder')).to.eql(false);
                            expect(videoWrapper.classList.contains('show-video')).to.eql(false);
                            expect(window.GuardianJSInterface.trackAction).to.have.been.calledOnce;
                            expect(window.GuardianJSInterface.trackAction).to.have.been.calledWith('youtube', JSON.stringify({id:'video1', eventType:'video:content:end'}));

                            done();
                        }, 1500);
                    });
            });
        });
    });
});
