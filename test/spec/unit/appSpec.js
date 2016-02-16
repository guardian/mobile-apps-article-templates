define([
    'squire'
], function(
    Squire
) {
    'use strict';

    var injector = new Squire();

    describe('ArticleTemplates/assets/js/app', function() {
        var App, app, domReady, monitor, ads, sandbox,
            dummyElem;

        before(function (done) {
            domReady = sinon.spy();
            monitor = {};
            ads = {};

            injector
                .mock('domReady', domReady)
                .mock('modules/monitor', monitor)
                .mock('modules/ads', ads)
                .require(['ArticleTemplates/assets/js/app'], function (testApp) {      
                    App = testApp;
                    done();
                });
        });

        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            dummyElem = document.createElement('div');

            sandbox.stub(window.document, 'getElementById').returns(dummyElem);
            sandbox.stub(App.prototype, 'loadCss');
        });

        after(function () {
            injector.remove();
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('app is instance of App', function () {
            app = new App();

            expect(app).to.be.instanceOf(App);

            expect(domReady).to.have.been.calledOnce;
        });

        it('loadCss called if skipStyle false', function () {
            dummyElem.dataset.skipStyle = "";

            app = new App();

            expect(App.prototype.loadCss).to.have.been.called;
            expect(App.prototype.loadCss).to.have.been.calledWith('assets/css/style-async.css');
            expect(domReady).to.have.been.called;
        });

        it('loadCss not called if skipStyle true', function () {
            dummyElem.dataset.skipStyle = "xxx";

            app = new App();

            expect(App.prototype.loadCss).not.to.have.been.called;
            expect(domReady).to.have.been.called;
        });
    });
});