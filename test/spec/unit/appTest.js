define([
    'squire'
], function(
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/app', function () {
        var injector,
            sandbox;

        var domReadyMock,
            adsMock, 
            utilMock;

        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            injector = new Squire();
            domReadyMock = sinon.spy();
            adsMock = {
                init: sinon.spy()
            };
            utilMock = {
                init: sinon.spy()
            };
        });

        afterEach(function () {
            sandbox.restore();
        });

        describe('init()', function () {
            describe('initialising layouts', function () {
                var dummyModule,
                    requireTemp;

                beforeEach(function () {
                    domReadyMock = function(next) {
                        next();
                    };

                    dummyModule = {
                        init: function(){}
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
                });

                afterEach(function () {
                    expect(adsMock.init).to.have.been.calledOnce;
                
                    require = requireTemp;

                    delete window.GU;
                });

                it('initialises article if GU.opts.contentType is article', function (done) {
                    injector
                        .mock('domReady', domReadyMock)
                        .mock('modules/ads', adsMock)
                        .mock('modules/util', utilMock)
                        .require(['ArticleTemplates/assets/js/app'], function (app) {
                            require = function(module, next) {
                                next(dummyModule);
                            };

                            GU.opts.contentType = 'article';

                            app.init();

                            expect(adsMock.init).to.have.been.calledWith({
                                adsEnabled: true,
                                adsConfig: 'xxx',
                                adsType: 'default',
                                mpuAfterParagraphs: 0
                            });

                            done();
                        });
                });

                it('initialises liveblog if GU.opts.contentType is liveblog', function (done) {
                    injector
                        .mock('domReady', domReadyMock)
                        .mock('modules/ads', adsMock)
                        .mock('modules/util', utilMock)
                        .require(['ArticleTemplates/assets/js/app'], function (app) {
                            require = function(module, next) {
                                next(dummyModule);
                            };

                            GU.opts.contentType = 'liveblog';
                            GU.opts.isMinute = false;

                            app.init();

                            expect(adsMock.init).to.have.been.calledWith({
                                adsEnabled: true,
                                adsConfig: 'xxx',
                                adsType: 'liveblog',
                                mpuAfterParagraphs: 0
                            });

                            done();
                        });
                });

                it('set adsType to default if liveblog and GU.opts.isMinute is truthy', function (done) {
                    injector
                        .mock('domReady', domReadyMock)
                        .mock('modules/ads', adsMock)
                        .mock('modules/util', utilMock)
                        .require(['ArticleTemplates/assets/js/app'], function (app) {
                            require = function(module, next) {
                                next(dummyModule);
                            };

                            GU.opts.contentType = 'liveblog';
                            GU.opts.isMinute = true;

                            app.init();

                            expect(adsMock.init).to.have.been.calledWith({
                                adsEnabled: true,
                                adsConfig: 'xxx',
                                adsType: 'default',
                                mpuAfterParagraphs: 0
                            });

                            done();
                        });
                });

                it('initialises audio if GU.opts.contentType is audio', function (done) {
                    injector
                        .mock('domReady', domReadyMock)
                        .mock('modules/ads', adsMock)
                        .mock('modules/util', utilMock)
                        .require(['ArticleTemplates/assets/js/app'], function (app) {
                            require = function(module, next) {
                                next(dummyModule);
                            };

                            GU.opts.contentType = 'audio';

                            app.init();

                            expect(adsMock.init).to.have.been.calledWith({
                                adsEnabled: true,
                                adsConfig: 'xxx',
                                adsType: 'default',
                                mpuAfterParagraphs: 0
                            });

                            done();
                        });
                });

                it('initialises gallery if GU.opts.contentType is gallery', function (done) {
                    injector
                        .mock('domReady', domReadyMock)
                        .mock('modules/ads', adsMock)
                        .mock('modules/util', utilMock)
                        .require(['ArticleTemplates/assets/js/app'], function (app) {
                            require = function(module, next) {
                                next(dummyModule);
                            };

                            GU.opts.contentType = 'gallery';

                            app.init();

                            expect(adsMock.init).to.have.been.calledWith({
                                adsEnabled: true,
                                adsConfig: 'xxx',
                                adsType: 'default',
                                mpuAfterParagraphs: 0
                            });

                            done();
                        });
                });

                it('initialises football if GU.opts.contentType is football', function (done) {
                    injector
                        .mock('domReady', domReadyMock)
                        .mock('modules/ads', adsMock)
                        .mock('modules/util', utilMock)
                        .require(['ArticleTemplates/assets/js/app'], function (app) {
                            require = function(module, next) {
                                next(dummyModule);
                            };

                            GU.opts.contentType = 'football';

                            app.init();

                            expect(adsMock.init).to.have.been.calledWith({
                                adsEnabled: true,
                                adsConfig: 'xxx',
                                adsType: 'default',
                                mpuAfterParagraphs: 0
                            });

                            done();
                        });
                });

                it('initialises cricket if GU.opts.contentType is cricket', function (done) {
                    injector
                        .mock('domReady', domReadyMock)
                        .mock('modules/ads', adsMock)
                        .mock('modules/util', utilMock)
                        .require(['ArticleTemplates/assets/js/app'], function (app) {
                            require = function(module, next) {
                                next(dummyModule);
                            };

                            GU.opts.contentType = 'cricket';

                            app.init();

                            expect(adsMock.init).to.have.been.calledWith({
                                adsEnabled: true,
                                adsConfig: 'xxx',
                                adsType: 'default',
                                mpuAfterParagraphs: 0
                            });

                            done();
                        });
                });

                it('initialises common if GU.opts.contentType is interactive', function (done) {
                    injector
                        .mock('domReady', domReadyMock)
                        .mock('modules/ads', adsMock)
                        .mock('modules/util', utilMock)
                        .require(['ArticleTemplates/assets/js/app'], function (app) {
                            require = function(module, next) {
                                next(dummyModule);
                            };

                            GU.opts.contentType = 'interactive';

                            app.init();

                            expect(adsMock.init).to.have.been.calledWith({
                                adsEnabled: true,
                                adsConfig: 'xxx',
                                adsType: 'default',
                                mpuAfterParagraphs: 0
                            });

                            done();
                        });
                });
            });

        });
    });
});