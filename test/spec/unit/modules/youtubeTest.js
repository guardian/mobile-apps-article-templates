define([
    'modules/util',
    'squire'
], function (
    util,
    Squire
) {
    'use strict';

    describe.only('ArticleTemplates/assets/js/modules/youtube', function () {
        var sandbox,
            container,
            injector;

        var getVideoWrapper = function(id) {
            var videoWrapper = document.createElement('div'),
                placeholder = document.createElement('div'),
                touchpoint = document.createElement('div'),
                iframe = document.createElement('iframe');

            placeholder.classList.add('youtube-media__placeholder');
            touchpoint.classList.add('youtube-media__touchpoint');
            placeholder.appendChild(touchpoint);

            iframe.classList.add('youtube-media');
            iframe.id = id;

            videoWrapper.appendChild(placeholder);
            videoWrapper.appendChild(iframe);

            return videoWrapper;
        };

        beforeEach(function () {
            container = document.createElement('div');
            container.id = 'container';
            document.body.appendChild(container);

            injector = new Squire();
            sandbox = sinon.sandbox.create();

            window.GU = {};
            window.YT = {
                players: []
            };

            util.init();
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
  
            sandbox.restore();
        });

        describe('init()', function () {
            var scriptAdded;

            function Player(id, options) {
                window.YT.players.push({
                    onReady: options.events.onReady,
                    onStateChange: options.events.onStateChange
                });
            };

            Player.prototype = {
                playVideo: function() {},
                getDuration: function() {},
                getCurrentTime: function() {},
                pauseVideo: sinon.spy()
            };

            beforeEach(function() {
                scriptAdded = false;

                window.YT.Player = Player;
                
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
            
                    return currentTime - this.startTime;
                });
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

            it('handles onPlayerReady', function (done) {
                injector
                    .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                        var videoWrapper = getVideoWrapper('video1'),
                            placeholder = videoWrapper.querySelector('.youtube-media__placeholder');

                        container.appendChild(videoWrapper);
                       
                        youtube.init();

                        expect(window.YT.players.length).to.eql(1);

                        window.YT.players[0].onReady('video1');

                        expect(Player.prototype.getDuration).to.have.been.calledOnce;
                        expect(placeholder.classList.contains('fade-touchpoint')).to.eql(true);

                        done();
                    });
            });

            it('plays video on touchpoint click and hides placeholder', function (done) {
                injector
                    .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                        var event = document.createEvent('HTMLEvents'),
                            videoWrapper = getVideoWrapper('video1'),
                            touchpoint = videoWrapper.querySelector('.youtube-media__touchpoint');

                        container.appendChild(videoWrapper);
                       
                        youtube.init();

                        expect(window.YT.players.length).to.eql(1);

                        window.YT.players[0].onReady('video1');

                        event.initEvent('click', true, true);
                        touchpoint.dispatchEvent(event);

                        expect(Player.prototype.playVideo).to.have.been.calledOnce;
                        expect(videoWrapper.classList.contains('fade-placeholder')).to.eql(true);

                        setTimeout(function() {
                            expect(videoWrapper.classList.contains('hide-placeholder')).to.eql(true);
                            done();
                        }, 500);
                    });
            });

            it('handles onPlayerStateChange when ENDED', function (done) {
                injector
                    .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                        var videoWrapper = getVideoWrapper('video1');

                        videoWrapper.classList.add('hide-placeholder');
                        videoWrapper.classList.add('fade-placeholder');

                        container.appendChild(videoWrapper);
                       
                        youtube.init();

                        expect(window.YT.players.length).to.eql(1);

                        window.YT.PlayerState = {
                            'ENDED': 1, 
                            'PLAYING': 0, 
                            'PAUSED': 0, 
                            'BUFFERING': 0, 
                            'CUED': 0
                        };

                        window.YT.players[0].onStateChange({
                            data: 1
                        });

                        expect(videoWrapper.classList.contains('hide-placeholder')).to.eql(false);

                        setTimeout(function () {
                            expect(videoWrapper.classList.contains('fade-placeholder')).to.eql(false);
                            done();
                        }, 1100);
                    });
            });

            it('handles onPlayerStateChange when PLAYING from start', function (done) {
                injector
                    .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                        var videoWrapper = getVideoWrapper('video1');

                        videoWrapper.classList.add('hide-placeholder');
                        videoWrapper.classList.add('fade-placeholder');

                        container.appendChild(videoWrapper);
                       
                        youtube.init();

                        expect(window.YT.players.length).to.eql(1);

                        window.YT.PlayerState = {
                            'ENDED': 0, 
                            'PLAYING':  1, 
                            'PAUSED': 0, 
                            'BUFFERING': 0, 
                            'CUED': 0
                        };

                        window.YT.players[0].onStateChange({
                            data: 1
                        });

                        expect(Player.prototype.getCurrentTime).to.have.been.called;
                        // TODO: test tracking call made

                        done();
                    });
            });

            it('handles onPlayerStateChange when PLAYING from start', function (done) {
                injector
                    .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                        var videoWrapper = getVideoWrapper('video1');

                        videoWrapper.classList.add('hide-placeholder');
                        videoWrapper.classList.add('fade-placeholder');

                        container.appendChild(videoWrapper);
                       
                        youtube.init();

                        expect(window.YT.players.length).to.eql(1);

                        window.YT.PlayerState = {
                            'ENDED': 0, 
                            'PLAYING':  1, 
                            'PAUSED': 0, 
                            'BUFFERING': 0, 
                            'CUED': 0
                        };

                        window.YT.players[0].onStateChange({
                            data: 1
                        });

                        expect(Player.prototype.getCurrentTime).to.have.been.called;
                        // TODO: test tracking call not made

                        done();
                    });
            });

            it('handles onPlayerStateChange and tracks progress', function (done) {
                this.timeout(15000);

                injector
                    .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                        var event = document.createEvent('HTMLEvents'),
                            videoWrapper = getVideoWrapper('video1'),
                            touchpoint = videoWrapper.querySelector('.youtube-media__touchpoint');

                        container.appendChild(videoWrapper);
                       
                        youtube.init();

                        expect(window.YT.players.length).to.eql(1);

                        window.YT.players[0].onReady('video1');

                        event.initEvent('click', true, true);
                        touchpoint.dispatchEvent(event);

                        // TODO: test tracking play for video1

                        expect(Player.prototype.playVideo).to.have.been.calledOnce;

                        window.YT.PlayerState = {
                            'ENDED': 0, 
                            'PLAYING':  1, 
                            'PAUSED': 0, 
                            'BUFFERING': 0, 
                            'CUED': 0
                        };

                        window.YT.players[0].onStateChange({
                            data: 1
                        });
            
                        setTimeout(function() {
                            // TODO: test tracking of 25% progress of video1

                            // kill progress tracker by ending the video
                            window.YT.PlayerState = {
                                'ENDED': 1, 
                                'PLAYING':  0, 
                                'PAUSED': 0, 
                                'BUFFERING': 0, 
                                'CUED': 0
                            };

                            window.YT.players[0].onStateChange({
                                data: 1
                            });

                            done();
                        }, 10000);
                    });
            });

            it('pause video when other video begins and track new video', function (done) {
                this.timeout(15000);

                injector
                    .require(['ArticleTemplates/assets/js/modules/youtube'], function (youtube) {
                        var event = document.createEvent('HTMLEvents'),
                            videoWrapper1 = getVideoWrapper('video1'),
                            touchpoint1 = videoWrapper1.querySelector('.youtube-media__touchpoint'),
                            videoWrapper2 = getVideoWrapper('video2'),
                            touchpoint2 = videoWrapper2.querySelector('.youtube-media__touchpoint');

                        container.appendChild(videoWrapper1);
                        container.appendChild(videoWrapper2);
                       
                        youtube.init();

                        expect(window.YT.players.length).to.eql(2);

                        window.YT.players[0].onReady('video1');
                        window.YT.players[1].onReady('video2');

                        event.initEvent('click', true, true);
                        
                        touchpoint1.dispatchEvent(event);

                        // TODO: test track play for video1

                        expect(Player.prototype.playVideo).to.have.been.calledOnce;

                        touchpoint2.dispatchEvent(event);

                        expect(Player.prototype.playVideo).to.have.been.calledTwice;

                        window.YT.PlayerState = {
                            'ENDED': 0, 
                            'PLAYING':  1, 
                            'PAUSED': 0, 
                            'BUFFERING': 0, 
                            'CUED': 0
                        };

                        window.YT.players[1].onStateChange({
                            data: 1
                        });

                        expect(Player.prototype.pauseVideo).to.have.been.calledOnce;

                        // TODO: test track play for video2

                        setTimeout(function () {
                            // TODO: test tracking of 25% progress for video2

                            // kill progress tracker by ending the video
                            window.YT.PlayerState = {
                                'ENDED': 1, 
                                'PLAYING':  0, 
                                'PAUSED': 0, 
                                'BUFFERING': 0, 
                                'CUED': 0
                            };

                            window.YT.players[1].onStateChange({
                                data: 1
                            });

                            done();
                        }, 10000);
                    });
            });
        });
    });
});