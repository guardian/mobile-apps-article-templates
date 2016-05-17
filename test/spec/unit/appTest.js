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
            domReadyMock = sinon.spy();
            monitorMock = {
                init: sinon.spy(),
                setContext: sinon.spy()
            };
            adsMock = {
                init: sinon.spy()
            };
            sandbox = sinon.sandbox.create();
            injector = new Squire();
            utilMock = {
                init: sinon.spy()
            };
        });

        afterEach(function () {
            sandbox.restore();
        });

        describe('app.init()', function () {
            beforeEach(function () {
                window.GU = {
                    opts: {}
                };
            });

            afterEach(function () {
                delete window.GU;
            });

            it('loadCss called if skipStyle falsey', function (done) {
                injector
                    .mock('domReady', domReadyMock)
                    .mock('modules/monitor', monitorMock)
                    .mock('modules/ads', adsMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/app'], function (app) {
                        sandbox.stub(app, 'initUtil');
                        sandbox.stub(app, 'loadCss');

                        app.init();

                        expect(app.initUtil).to.have.been.calledOnce;
                        expect(app.loadCss).to.have.been.calledOnce;
                        expect(domReadyMock).to.have.been.calledOnce;

                        done();
                    });
            });

            it('loadCss not called if skipStyle true', function (done) {
                injector
                    .mock('domReady', domReadyMock)
                    .mock('modules/monitor', monitorMock)
                    .mock('modules/ads', adsMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/app'], function (app) {
                        sandbox.stub(app, 'initUtil');
                        sandbox.stub(app, 'loadCss');

                        GU.opts.skipStyle = true;

                        app.init();

                        expect(app.initUtil).to.have.been.calledOnce;
                        expect(app.loadCss).not.to.have.been.called;
                        expect(domReadyMock).to.have.been.calledOnce;

                        done();
                    });
            }); 
        });

        describe('app.loadCss()', function () {
            beforeEach(function () {
                window.GU = {
                    opts: {
                        templatesDirectory: 'xxx/'
                    }
                };
            });

            afterEach(function () {
                delete window.GU;
            });

            it('adds style link to document', function (done) {
                injector
                    .mock('domReady', domReadyMock)
                    .mock('modules/monitor', monitorMock)
                    .mock('modules/ads', adsMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/app'], function (app) {
                        var dummyHeadElem = {
                            appendChild: sinon.spy()
                        };

                        sandbox.stub(window.document, 'createElement').returns({});
                        sandbox.stub(window.document, 'getElementsByTagName').returns([dummyHeadElem]);

                        app.loadCss();

                        expect(window.document.createElement).to.have.been.calledOnce;
                        expect(window.document.createElement).to.have.been.calledWith('link');
                        expect(window.document.getElementsByTagName).to.have.been.calledOnce;
                        expect(window.document.getElementsByTagName).to.have.been.calledWith('head');
                        expect(dummyHeadElem.appendChild).to.have.been.calledOnce;
                        expect(dummyHeadElem.appendChild).to.have.been.calledWith({
                            type: 'text/css',
                            rel: 'stylesheet',
                            href: 'xxx/assets/css/style-async.css'
                        });    

                        done();
                    });
            }); 
        });

        describe('app.initLayout()', function () {
            it('calls monitor.setContext', function (done) {
                injector
                    .mock('domReady', domReadyMock)
                    .mock('modules/monitor', monitorMock)
                    .mock('modules/ads', adsMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/app'], function (app) {
                        var layoutObj = {
                            init: function() {}
                        };

                        app.initLayout('xxx', layoutObj);

                        expect(monitorMock.setContext).to.have.been.calledOnce;
                        expect(monitorMock.setContext).to.have.been.calledWith('xxx', layoutObj.init);
                        
                        done();
                    });
            }); 
        });

        describe('app.onDomReady()', function () {
            var requireTemp;

            beforeEach(function () {
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
                    adsType: GU.opts.contentType ? 'liveblog' : '',
                    mpuAfterParagraphs: GU.opts.mpuAfterParagraphs
                });

                require = requireTemp;

                delete window.GU;
            });

            it('init article if GU.opts.contentType is article', function (done) {
                injector
                    .mock('domReady', domReadyMock)
                    .mock('modules/monitor', monitorMock)
                    .mock('modules/ads', adsMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/app'], function (app) {
                        require = sinon.stub();

                        GU.opts.contentType = 'article';

                        app.onDomReady();

                        expect(require).to.have.been.calledOnce;
                        expect(require).to.have.been.calledWith(['article']);                        

                        done();
                    });
            });

            it('init liveblog if GU.opts.contentType is liveblog', function (done) {
                injector
                    .mock('domReady', domReadyMock)
                    .mock('modules/monitor', monitorMock)
                    .mock('modules/ads', adsMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/app'], function (app) {
                        require = sinon.stub();

                        GU.opts.contentType = 'liveblog';

                        app.onDomReady();

                        expect(require).to.have.been.calledOnce;
                        expect(require).to.have.been.calledWith(['liveblog']);                        

                        done();
                    });
            });

            it('init audio if GU.opts.contentType is audio', function (done) {
                injector
                    .mock('domReady', domReadyMock)
                    .mock('modules/monitor', monitorMock)
                    .mock('modules/ads', adsMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/app'], function (app) {
                        require = sinon.stub();

                        GU.opts.contentType = 'audio';

                        app.onDomReady();

                        expect(require).to.have.been.calledOnce;
                        expect(require).to.have.been.calledWith(['audio']);                        

                        done();
                    });
            });

            it('init gallery if GU.opts.contentType is gallery', function (done) {
                injector
                    .mock('domReady', domReadyMock)
                    .mock('modules/monitor', monitorMock)
                    .mock('modules/ads', adsMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/app'], function (app) {
                        require = sinon.stub();

                        GU.opts.contentType = 'gallery';

                        app.onDomReady();

                        expect(require).to.have.been.calledOnce;
                        expect(require).to.have.been.calledWith(['gallery']);                        

                        done();
                    });
            });

            it('init football if GU.opts.contentType is football', function (done) {
                injector
                    .mock('domReady', domReadyMock)
                    .mock('modules/monitor', monitorMock)
                    .mock('modules/ads', adsMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/app'], function (app) {
                        require = sinon.stub();

                        GU.opts.contentType = 'football';

                        app.onDomReady();

                        expect(require).to.have.been.calledOnce;
                        expect(require).to.have.been.calledWith(['football']);                        

                        done();
                    });
            });

            it('init cricket if GU.opts.contentType is cricket', function (done) {
                injector
                    .mock('domReady', domReadyMock)
                    .mock('modules/monitor', monitorMock)
                    .mock('modules/ads', adsMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/app'], function (app) {
                        require = sinon.stub();

                        GU.opts.contentType = 'cricket';

                        app.onDomReady();

                        expect(require).to.have.been.calledOnce;
                        expect(require).to.have.been.calledWith(['cricket']);                        

                        done();
                    });
            });

            it('init common if GU.opts.contentType is interactive', function (done) {
                injector
                    .mock('domReady', domReadyMock)
                    .mock('modules/monitor', monitorMock)
                    .mock('modules/ads', adsMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/app'], function (app) {
                        require = sinon.stub();

                        GU.opts.contentType = 'interactive';

                        app.onDomReady();

                        expect(require).to.have.been.calledOnce;
                        expect(require).to.have.been.calledWith(['bootstraps/common']);

                        done();
                    });
            });
        });

        describe('app.initUtil()', function () {
            it('calls util.init', function (done) {
                injector
                    .mock('domReady', domReadyMock)
                    .mock('modules/monitor', monitorMock)
                    .mock('modules/ads', adsMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/app'], function (app) {
                        app.initUtil();

                        expect(utilMock.init).to.have.been.calledOnce;
                        
                        done();
                    });
            }); 
        });
    });
});