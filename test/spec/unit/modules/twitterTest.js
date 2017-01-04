define([
    'modules/util',
    'squire'
], function (
    util,
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/modules/twitter', function () {
        var sandbox,
            container,
            injector;

        beforeEach(function () {
            container = document.createElement('div');
            container.id = 'container';
            document.body.appendChild(container);

            injector = new Squire();
            sandbox = sinon.sandbox.create();

            window.GU = {
                opts: {
                    isMinute: false
                }
            };

            util.init();
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
            it('does not add twitter script if no tweet on page', function (done) {
                injector
                    .require(['ArticleTemplates/assets/js/modules/twitter'], function (twitter) {
                        twitter.init();

                        expect(document.querySelectorAll('#twitter-widget').length).to.eql(0);

                        done();
                    });
            });

            it('adds twitter script if not the minute and js-tweet tweet on page', function (done) {
                injector
                    .require(['ArticleTemplates/assets/js/modules/twitter'], function (twitter) {
                        container.innerHTML = '<blockquote class="js-tweet"></blockquote>';

                        twitter.init();

                        expect(document.querySelectorAll('#twitter-widget').length).to.eql(1);

                        done();
                    });
            });

            it('adds twitter script if not the minute and twitter-tweet tweet on page', function (done) {
                injector
                    .require(['ArticleTemplates/assets/js/modules/twitter'], function (twitter) {
                        container.innerHTML = '<blockquote class="twitter-tweet"></blockquote>';

                        twitter.init();

                        expect(document.querySelectorAll('#twitter-widget').length).to.eql(1);

                        done();
                    });
            });

            it('remove web-intent class on links in tweet on iOS', function (done) {
                injector
                    .require(['ArticleTemplates/assets/js/modules/twitter'], function (twitter) {
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
                                load: sinon.spy()
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

                        done();
                    });
            });

            it('fix vine autoPlays on iOS', function (done) {
                injector
                    .require(['ArticleTemplates/assets/js/modules/twitter'], function (twitter) {
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

                        done();
                    });
            });

            it('add scroll event listener to enhances tweets on scroll', function (done) {
                injector
                    .require(['ArticleTemplates/assets/js/modules/twitter'], function (twitter) {
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

                        sandbox.stub(window.GU.util, 'debounce');

                        twitter.init();

                        expect(window.addEventListener).to.have.been.calledOnce;
                        expect(window.addEventListener).to.have.been.calledWith('scroll');
                        expect(window.GU.util.debounce).to.have.been.calledOnce;

                        done();
                    });
            });
        });
    });
});