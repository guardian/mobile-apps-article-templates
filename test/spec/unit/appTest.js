define([
    'squire'
], function (
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/app', function () {
        var app,
            sandbox;

        var domReadyMock,
            adsMock, 
            utilMock;

        beforeEach(function (done) {
            var injector = new Squire();

            sandbox = sinon.sandbox.create();
            
            domReadyMock = function (next) {
                next();
            };
            
            adsMock = {
                init: sandbox.spy()
            };
            
            utilMock = {};

            injector
                .mock('domReady', domReadyMock)
                .mock('modules/ads', adsMock)
                .mock('modules/util', utilMock)
                .require(['ArticleTemplates/assets/js/app'], function (sut) {
                    app = sut;

                    done();
                });
        });

        afterEach(function () {
            sandbox.restore();
        });

        describe('init()', function () {
            describe('initialising layouts', function () {
                var dummyModule,
                    requireTemp;

                beforeEach(function () {
                    dummyModule = {
                        init: function (){}
                    };

                    requireTemp = require;

                    window.GU = {
                        opts: {
                            adsEnabled: 'true',
                            adsConfig: 'xxx',
                            contentType: 'liveblog',
                            mpuAfterParagraphs: 0
                        }
                    };

                    require = function (module, next) {
                        next(dummyModule);
                    };
                });

                afterEach(function () {
                    expect(window.GU.util).to.not.be.undefined;
                    
                    require = requireTemp;

                    delete window.GU;
                });

                it('does not initialise ads module if GU.opts.adsEnabled is "false"', function () {
                    GU.opts.contentType = 'article';
                    GU.opts.adsEnabled = 'false';

                    app.init();

                    expect(adsMock.init).not.to.have.been.called;
                });

                it('initialises ads module if GU.opts.adsEnabled contains "mpu"', function () {
                    GU.opts.contentType = 'article';
                    GU.opts.adsEnabled = 'mpu';

                    app.init();

                    expect(adsMock.init).to.have.been.calledOnce;
                    expect(adsMock.init).to.have.been.calledWith({
                        adsConfig: 'xxx',
                        adsType: 'default',
                        mpuAfterParagraphs: 0
                    });
                });

                it('initialises article if GU.opts.contentType is article', function () {
                    GU.opts.contentType = 'article';

                    app.init();

                    expect(adsMock.init).to.have.been.calledOnce;
                    expect(adsMock.init).to.have.been.calledWith({
                        adsConfig: 'xxx',
                        adsType: 'default',
                        mpuAfterParagraphs: 0
                    });
                });

                it('initialises liveblog if GU.opts.contentType is liveblog', function () {
                    GU.opts.contentType = 'liveblog';
                    GU.opts.isMinute = false;

                    app.init();

                    expect(adsMock.init).to.have.been.calledOnce;
                    expect(adsMock.init).to.have.been.calledWith({
                        adsConfig: 'xxx',
                        adsType: 'liveblog',
                        mpuAfterParagraphs: 0
                    });
                });

                it('set adsType to default if liveblog and GU.opts.isMinute is truthy', function () {
                    GU.opts.contentType = 'liveblog';
                    GU.opts.isMinute = true;

                    app.init();

                    expect(adsMock.init).to.have.been.calledOnce;
                    expect(adsMock.init).to.have.been.calledWith({
                        adsConfig: 'xxx',
                        adsType: 'default',
                        mpuAfterParagraphs: 0
                    });
                });

                it('set adsType to liveblog if page contains .article__body--liveblog', function () {
                    var liveblogElem = document.createElement('div');

                    liveblogElem.classList.add('article__body--liveblog');

                    document.body.appendChild(liveblogElem);

                    GU.opts.contentType = 'football';

                    app.init();

                    expect(adsMock.init).to.have.been.calledOnce;
                    expect(adsMock.init).to.have.been.calledWith({
                        adsConfig: 'xxx',
                        adsType: 'liveblog',
                        mpuAfterParagraphs: 0
                    });

                    liveblogElem.remove();
                });

                it('initialises audio if GU.opts.contentType is audio', function () {
                    GU.opts.contentType = 'audio';

                    app.init();

                    expect(adsMock.init).to.have.been.calledOnce;
                    expect(adsMock.init).to.have.been.calledWith({
                        adsConfig: 'xxx',
                        adsType: 'default',
                        mpuAfterParagraphs: 0
                    });
                });

                it('initialises gallery if GU.opts.contentType is gallery', function () {
                    GU.opts.contentType = 'gallery';

                    app.init();

                    expect(adsMock.init).to.have.been.calledOnce;
                    expect(adsMock.init).to.have.been.calledWith({
                        adsConfig: 'xxx',
                        adsType: 'default',
                        mpuAfterParagraphs: 0
                    });
                });

                it('initialises football if GU.opts.contentType is football', function () {
                    GU.opts.contentType = 'football';

                    app.init();

                    expect(adsMock.init).to.have.been.calledOnce;
                    expect(adsMock.init).to.have.been.calledWith({
                        adsConfig: 'xxx',
                        adsType: 'default',
                        mpuAfterParagraphs: 0
                    });
                });

                it('initialises cricket if GU.opts.contentType is cricket', function () {
                    GU.opts.contentType = 'cricket';

                    app.init();

                    expect(adsMock.init).to.have.been.calledOnce;
                    expect(adsMock.init).to.have.been.calledWith({
                        adsConfig: 'xxx',
                        adsType: 'default',
                        mpuAfterParagraphs: 0
                    });
                });

                it('initialises common if GU.opts.contentType is interactive', function () {
                    GU.opts.contentType = 'interactive';

                    app.init();

                    expect(adsMock.init).to.have.been.calledOnce;
                    expect(adsMock.init).to.have.been.calledWith({
                        adsConfig: 'xxx',
                        adsType: 'default',
                        mpuAfterParagraphs: 0
                    });
                });
            });

        });
    });
});