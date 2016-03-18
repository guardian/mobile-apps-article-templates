define([
    'squire'
], function(
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/app', function() {
        var app, domReadyMock, monitorMock, 
            adsMock, sandbox, injector;

        beforeEach(function () {
            domReadyMock = sinon.spy();
            monitorMock = {};
            adsMock = {};
            sandbox = sinon.sandbox.create();
            injector = new Squire();
        });

        afterEach(function () {
            sandbox.restore();
        });

        describe("App.prototype.init()", function() {
            var dummyElem;

            beforeEach(function () {
                dummyElem = document.createElement('div');
                sandbox.stub(window.document, 'getElementById').returns(dummyElem);
            });

            it('app is instance of App', function (done) {
                injector
                    .mock('domReady', domReadyMock)
                    .mock('modules/monitor', monitorMock)
                    .mock('modules/ads', adsMock)
                    .require(['ArticleTemplates/assets/js/app'], function (App) {
                        sandbox.stub(App.prototype, 'loadCss');

                        app = new App();

                        expect(app).to.be.instanceOf(App);

                        done();
                    });
            });

            it('loadCss called if skipStyle false', function (done) {
                injector
                    .mock('domReady', domReadyMock)
                    .mock('modules/monitor', monitorMock)
                    .mock('modules/ads', adsMock)
                    .require(['ArticleTemplates/assets/js/app'], function (App) {
                        sandbox.stub(App.prototype, 'loadCss');

                        dummyElem.dataset.skipStyle = "";
                        app = new App();

                        expect(App.prototype.loadCss).to.have.been.calledOnce;
                        expect(App.prototype.loadCss).to.have.been.calledWith('assets/css/style-async.css');
                        expect(domReadyMock).to.have.been.calledOnce;

                        done();
                    });
            });

            it('loadCss not called if skipStyle true', function (done) {
                injector
                    .mock('domReady', domReadyMock)
                    .mock('modules/monitor', monitorMock)
                    .mock('modules/ads', adsMock)
                    .require(['ArticleTemplates/assets/js/app'], function (App) {
                        sandbox.stub(App.prototype, 'loadCss');

                        dummyElem.dataset.skipStyle = "xxx";
                        app = new App();

                        expect(App.prototype.loadCss).not.to.have.been.called;
                        expect(domReadyMock).to.have.been.calledOnce;

                        done();
                    });
            }); 
        });

        describe("App.prototype.onDomReady()", function () {
            it("creates Article if contentType is article", function (done) {
               injector
                    .mock('domReady', domReadyMock)
                    .mock('modules/monitor', monitorMock)
                    .mock('modules/ads', adsMock)
                    .require(['ArticleTemplates/assets/js/app'], function (App) {
                        sandbox.stub(App.prototype, 'init');

                        app = new App();

                        // app.onDomReady();

                        done();
                    }); 
            });
        });
    });
});