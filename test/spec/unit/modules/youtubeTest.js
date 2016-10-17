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
            iframe.src = 'https://www.youtube.com/embed/9tBGBNB2eDA?modestbranding=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1';

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

            Player.prototype.playVideo = sinon.spy();
            Player.prototype.getDuration = sinon.spy();

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
        });
    });
});