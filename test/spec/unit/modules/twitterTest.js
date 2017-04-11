define([
    'squire'
], function (
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/modules/twitter', function () {
        var twitter,
            sandbox,
            container;

        var utilMock;

        beforeEach(function (done) {
            var injector = new Squire();
            
            sandbox = sinon.sandbox.create();

            container = document.createElement('div');
            container.id = 'container';
            document.body.appendChild(container);

            window.GU = {
                opts: {
                    isMinute: false
                }
            };

            utilMock = {
                debounce: sandbox.spy()
            };

            injector
                .mock('modules/util', utilMock)
                .require(['ArticleTemplates/assets/js/modules/twitter'], function (sut) {
                    twitter = sut;

                    done();
                }); 
        });

        afterEach(function () {
            var twitterScript = document.getElementById('twitter-widget');

            if (twitterScript) {
                twitterScript.parentNode.removeChild(twitterScript);
            }

            document.body.removeChild(container);

            delete window.GU;
  
            sandbox.restore();
        });

        describe('init()', function () {
            it('does not add twitter script if no tweet on page', function () {
                twitter.init();

                expect(document.querySelectorAll('#twitter-widget').length).to.eql(0);
            });

            it('adds twitter script if not the minute and js-tweet tweet on page', function () {
                container.innerHTML = '<blockquote class="js-tweet"></blockquote>';

                twitter.init();

                expect(document.querySelectorAll('#twitter-widget').length).to.eql(1);
            });

            it('adds twitter script if not the minute and twitter-tweet tweet on page', function () {
                container.innerHTML = '<blockquote class="twitter-tweet"></blockquote>';

                twitter.init();

                expect(document.querySelectorAll('#twitter-widget').length).to.eql(1);
            });

            it('remove web-intent class on links in tweet on iOS', function () {
                var dummyTweet = document.createElement('iframe'),
                    blockquote = document.createElement('blockquote');

                blockquote.classList.add('twitter-tweet');
                container.appendChild(dummyTweet);
                container.appendChild(blockquote);
                dummyTweet.contentWindow.document.body.innerHTML = '<a class="web-intent" href="xxx"></a><a id="myLink" class="web-intent" href="xxx"></a><a class="web-intent" href="xxx"></a>';

                window.twttr = {
                    events: {
                        bind: function (type, callback) {
                            if (type === 'rendered') {
                                callback({
                                    target: dummyTweet
                                });
                            }
                        }
                    },
                    widgets: {
                        load: sandbox.spy()
                    }
                };

                // intercept appendChild and force load event on script
                sandbox.stub(document.body, 'appendChild', function (script) {
                    script.onload();
                });

                var myLink = dummyTweet.contentWindow.document.getElementById('myLink'); 

                expect(myLink.classList.contains('web-intent')).to.eql(true);

                twitter.init();

                expect(myLink.classList.contains('web-intent')).to.eql(false);
            });

            it('fix vine autoPlays on iOS', function () {
                var dummyTweet = document.createElement('iframe'),
                    blockquote = document.createElement('blockquote');

                blockquote.classList.add('twitter-tweet');
                container.appendChild(dummyTweet);
                container.appendChild(blockquote);
                dummyTweet.contentWindow.document.body.innerHTML = '<div class="MediaCard"></div><iframe src="https://vine.com"></iframe>';
                dummyTweet.setAttribute('height', 100);

                window.twttr = {
                    events: {
                        bind: function (type, callback) {
                            if (type === 'rendered') {
                                callback({
                                    target: dummyTweet
                                });
                            }
                        }
                    },
                    widgets: {
                        load: sinon.spy()
                    }
                };

                // intercept appendChild and force load event on script
                sandbox.stub(document.body, 'appendChild', function (script) {
                    script.onload();
                });

                var mediaCard = dummyTweet.contentWindow.document.querySelector('.MediaCard'); 

                expect(mediaCard.parentNode).to.eql(dummyTweet.contentWindow.document.body);
                expect(dummyTweet.hasAttribute('height')).to.eql(true);

                twitter.init();

                expect(mediaCard.parentNode).to.not.eql(dummyTweet.contentWindow.document.body);
                expect(dummyTweet.hasAttribute('height')).to.eql(false);
            });

            it('add scroll event listener to enhances tweets on scroll', function () {
                var blockquote = document.createElement('blockquote');

                blockquote.classList.add('twitter-tweet');

                container.appendChild(blockquote);

                window.twttr = {
                    events: {
                        bind: sinon.spy()
                    },
                    widgets: {
                        load: sinon.spy()
                    }
                };

                // intercept appendChild and force load event on script
                sandbox.stub(document.body, 'appendChild', function (script) {
                    script.onload();
                });

                sandbox.stub(window, 'addEventListener');

                twitter.init();

                expect(window.addEventListener).to.have.been.calledOnce;
                expect(window.addEventListener).to.have.been.calledWith('scroll');
                expect(utilMock.debounce).to.have.been.calledOnce;
            });
        });
    });
});