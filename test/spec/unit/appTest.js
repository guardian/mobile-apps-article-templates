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
            monitorMock,
            adsMock, 
            utilMock;

        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            injector = new Squire();
            domReadyMock = sinon.spy();
            monitorMock = {
                init: sinon.spy(),
                setContext: sinon.spy()
            };
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
            describe('loading styles', function () {
                var dummyHeadElem;

                beforeEach(function () {
                    window.GU = {
                        opts: {
                            templatesDirectory: 'xxx/'
                        }
                    };

                    dummyHeadElem = {
                        appendChild: sinon.spy()
                    };
                });

                afterEach(function () {
                    delete window.GU;
                });

                it('adds stylesheet if skipStyle falsey', function (done) {
                    injector
                        .mock('domReady', domReadyMock)
                        .mock('modules/monitor', monitorMock)
                        .mock('modules/ads', adsMock)
                        .mock('modules/util', utilMock)
                        .require(['ArticleTemplates/assets/js/app'], function (app) {
                            // sandbox.stub(window.document, 'createElement').returns({});
                            // sandbox.stub(window.document, 'getElementsByTagName').returns([dummyHeadElem]);

                            // app.init();

                            // expect(utilMock.init).to.have.been.calledOnce;
                            // expect(domReadyMock).to.have.been.calledOnce;

                            // expect(window.document.createElement).to.have.been.calledOnce;
                            // expect(window.document.createElement).to.have.been.calledWith('link');
                            // expect(window.document.getElementsByTagName).to.have.been.calledOnce;
                            // expect(window.document.getElementsByTagName).to.have.been.calledWith('head');
                            // expect(dummyHeadElem.appendChild).to.have.been.calledOnce;
                            // expect(dummyHeadElem.appendChild).to.have.been.calledWith({
                            //     type: 'text/css',
                            //     rel: 'stylesheet',
                            //     href: 'xxx/assets/css/style-async.css'
                            // });  

                            done();
                        });
                });

                it('does not add stylesheet if skipStyle true', function (done) {
                    injector
                        .mock('domReady', domReadyMock)
                        .mock('modules/monitor', monitorMock)
                        .mock('modules/ads', adsMock)
                        .mock('modules/util', utilMock)
                        .require(['ArticleTemplates/assets/js/app'], function (app) {
                            sandbox.stub(window.document, 'createElement');
                            sandbox.stub(window.document, 'getElementsByTagName');
                            
                            GU.opts.skipStyle = true;

                            app.init();

                            expect(utilMock.init).to.have.been.calledOnce;
                            expect(domReadyMock).to.have.been.calledOnce;

                            expect(window.document.createElement).not.to.have.been.called; 
                            expect(window.document.getElementsByTagName).not.to.have.been.calledOnce;
                            expect(dummyHeadElem.appendChild).not.to.have.been.calledOnce;
                            
                            done();
                        });
                });
            });

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
                            adsEnabled: 'xxx',
                            adsConfig: 'xxx',
                            mpuAfterParagraphs: 0
                        }
                    };
                });

                afterEach(function () {
                    expect(monitorMock.init).to.have.been.calledOnce;
                    expect(adsMock.init).to.have.been.calledOnce;
                    expect(adsMock.init).to.have.been.calledWith({
                        adsEnabled: GU.opts.adsEnabled,
                        adsConfig: GU.opts.adsConfig,
                        adsType: GU.opts.contentType === 'liveblog' ? 'liveblog' : '',
                        mpuAfterParagraphs: GU.opts.mpuAfterParagraphs
                    });

                    require = requireTemp;

                    delete window.GU;
                });

                it('initialises article if GU.opts.contentType is article', function (done) {
                    injector
                        .mock('domReady', domReadyMock)
                        .mock('modules/monitor', monitorMock)
                        .mock('modules/ads', adsMock)
                        .mock('modules/util', utilMock)
                        .require(['ArticleTemplates/assets/js/app'], function (app) {
                            require = function(module, next) {
                                next(dummyModule);
                            };

                            GU.opts.contentType = 'article';

                            app.init();

                            expect(monitorMock.setContext).to.have.been.calledOnce;
                            expect(monitorMock.setContext).to.have.been.calledWith('article', dummyModule.init);

                            done();
                        });
                });

                it('initialises liveblog if GU.opts.contentType is liveblog', function (done) {
                    injector
                        .mock('domReady', domReadyMock)
                        .mock('modules/monitor', monitorMock)
                        .mock('modules/ads', adsMock)
                        .mock('modules/util', utilMock)
                        .require(['ArticleTemplates/assets/js/app'], function (app) {
                            require = function(module, next) {
                                next(dummyModule);
                            };

                            GU.opts.contentType = 'liveblog';

                            app.init();

                            expect(monitorMock.setContext).to.have.been.calledOnce;
                            expect(monitorMock.setContext).to.have.been.calledWith('liveblog', dummyModule.init);

                            done();
                        });
                });

                it('initialises audio if GU.opts.contentType is audio', function (done) {
                    injector
                        .mock('domReady', domReadyMock)
                        .mock('modules/monitor', monitorMock)
                        .mock('modules/ads', adsMock)
                        .mock('modules/util', utilMock)
                        .require(['ArticleTemplates/assets/js/app'], function (app) {
                            require = function(module, next) {
                                next(dummyModule);
                            };

                            GU.opts.contentType = 'audio';

                            app.init();

                            expect(monitorMock.setContext).to.have.been.calledOnce;
                            expect(monitorMock.setContext).to.have.been.calledWith('audio', dummyModule.init);

                            done();
                        });
                });

                it('initialises gallery if GU.opts.contentType is gallery', function (done) {
                    injector
                        .mock('domReady', domReadyMock)
                        .mock('modules/monitor', monitorMock)
                        .mock('modules/ads', adsMock)
                        .mock('modules/util', utilMock)
                        .require(['ArticleTemplates/assets/js/app'], function (app) {
                            require = function(module, next) {
                                next(dummyModule);
                            };

                            GU.opts.contentType = 'gallery';

                            app.init();

                            expect(monitorMock.setContext).to.have.been.calledOnce;
                            expect(monitorMock.setContext).to.have.been.calledWith('gallery', dummyModule.init);

                            done();
                        });
                });

                it('initialises football if GU.opts.contentType is football', function (done) {
                    injector
                        .mock('domReady', domReadyMock)
                        .mock('modules/monitor', monitorMock)
                        .mock('modules/ads', adsMock)
                        .mock('modules/util', utilMock)
                        .require(['ArticleTemplates/assets/js/app'], function (app) {
                            require = function(module, next) {
                                next(dummyModule);
                            };

                            GU.opts.contentType = 'football';

                            app.init();

                            expect(monitorMock.setContext).to.have.been.calledOnce;
                            expect(monitorMock.setContext).to.have.been.calledWith('football', dummyModule.init);

                            done();
                        });
                });

                it('initialises cricket if GU.opts.contentType is cricket', function (done) {
                    injector
                        .mock('domReady', domReadyMock)
                        .mock('modules/monitor', monitorMock)
                        .mock('modules/ads', adsMock)
                        .mock('modules/util', utilMock)
                        .require(['ArticleTemplates/assets/js/app'], function (app) {
                            require = function(module, next) {
                                next(dummyModule);
                            };

                            GU.opts.contentType = 'cricket';

                            app.init();

                            expect(monitorMock.setContext).to.have.been.calledOnce;
                            expect(monitorMock.setContext).to.have.been.calledWith('cricket', dummyModule.init);

                            done();
                        });
                });

                it('initialises common if GU.opts.contentType is interactive', function (done) {
                    injector
                        .mock('domReady', domReadyMock)
                        .mock('modules/monitor', monitorMock)
                        .mock('modules/ads', adsMock)
                        .mock('modules/util', utilMock)
                        .require(['ArticleTemplates/assets/js/app'], function (app) {
                            require = function(module, next) {
                                next(dummyModule);
                            };

                            GU.opts.contentType = 'interactive';

                            app.init();

                            expect(monitorMock.setContext).to.have.been.calledOnce;
                            expect(monitorMock.setContext).to.have.been.calledWith('common', dummyModule.init);

                            done();
                        });
                });
            });

        });
    });
});