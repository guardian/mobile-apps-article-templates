define([
    'ArticleTemplates/assets/js/app'
], function(
    App
) {
    'use strict';

    describe('app.js', function() {
        var app, renderStub;

        beforeEach(function () {
            renderStub = sinon.stub(App.prototype, "render", function () {
                return "xxx";
            });

            app = new App("George");
        });

        afterEach(function () {
            renderStub.restore();
        });

        it("app is instance of App", function () {
            expect(app).to.be.instanceOf(App);
        });

        it("renders", function () {
            console.log(app.render());
        });
    });
});