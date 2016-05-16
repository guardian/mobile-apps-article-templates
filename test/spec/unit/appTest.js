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
    });
});