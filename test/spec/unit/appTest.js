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
            monitorMock = {};
            adsMock = {};
            sandbox = sinon.sandbox.create();
            injector = new Squire();
            utilMock = {
                init: sinon.spy()
            };
        });

        afterEach(function () {
            sandbox.restore();
        });

        describe("app.init()", function () {
            var dummyElem;

            beforeEach(function () {
                dummyElem = document.createElement('div');
                sandbox.stub(window.document, 'getElementById').returns(dummyElem);
            });

            it('loadCss called if skipStyle false', function (done) {
                injector
                    .mock('domReady', domReadyMock)
                    .mock('modules/monitor', monitorMock)
                    .mock('modules/ads', adsMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/app'], function (app) {
                        sandbox.stub(app, 'loadCss');

                        app.init();

                        expect(app.loadCss).to.have.been.calledOnce;
                        expect(app.loadCss).to.have.been.calledWith('assets/css/style-async.css');
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
                        sandbox.stub(app, 'loadCss');

                        dummyElem.dataset.skipStyle = "xxx";
                        
                        app.init()

                        expect(app.loadCss).not.to.have.been.called;
                        expect(domReadyMock).to.have.been.calledOnce;

                        done();
                    });
            }); 
        });

        describe("app.onDomReady()", function () {
            it("creates Article if contentType is article", function (done) {
               injector
                    .mock('domReady', domReadyMock)
                    .mock('modules/monitor', monitorMock)
                    .mock('modules/ads', adsMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/app'], function (app) {
                        done();
                    }); 
            });
        });
    });
});