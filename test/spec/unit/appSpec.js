define([
    'squire'
], function(
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/app', function() {
        var app, domReady, monitor, ads, sandbox,
            dummyElem, injector;

        beforeEach(function() {
            domReady = sinon.spy();
            monitor = {};
            ads = {};
            sandbox = sinon.sandbox.create();
            dummyElem = document.createElement('div');

            sandbox.stub(window.document, 'getElementById').returns(dummyElem);

            injector = new Squire();
        });

        afterEach(function() {
            sandbox.restore();
        });

        it('app is instance of App', function(done) {
            injector
                .mock('domReady', domReady)
                .mock('modules/monitor', monitor)
                .mock('modules/ads', ads)
                .require(['ArticleTemplates/assets/js/app'], function(App) {
                    sandbox.stub(App.prototype, 'loadCss');

                    app = new App();

                    expect(app).to.be.instanceOf(App);

                    done();
                });
        });

        it('loadCss called if skipStyle false', function(done) {
            injector
                .mock('domReady', domReady)
                .mock('modules/monitor', monitor)
                .mock('modules/ads', ads)
                .require(['ArticleTemplates/assets/js/app'], function(App) {
                    sandbox.stub(App.prototype, 'loadCss');

                    dummyElem.dataset.skipStyle = "";
                    app = new App();

                    expect(App.prototype.loadCss).to.have.been.calledOnce;
                    expect(App.prototype.loadCss).to.have.been.calledWith('assets/css/style-async.css');
                    expect(domReady).to.have.been.calledOnce;

                    done();
                });
        });

        it('loadCss not called if skipStyle true', function(done) {
            injector
                .mock('domReady', domReady)
                .mock('modules/monitor', monitor)
                .mock('modules/ads', ads)
                .require(['ArticleTemplates/assets/js/app'], function(App) {
                    sandbox.stub(App.prototype, 'loadCss');

                    dummyElem.dataset.skipStyle = "xxx";
                    app = new App();

                    expect(App.prototype.loadCss).not.to.have.been.called;
                    expect(domReady).to.have.been.calledOnce;

                    done();
                });
        });
    });
});