define([
    'squire'
], function(
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/bootstraps/article', function() {
        var injector,
            sandbox;
            
        var youtubeMock,
            twitterMock,
            witnessMock,
            outbrainMock,
            quizMock,
            membershipMock;

        beforeEach(function() {
            twitterMock = {
                init: sinon.spy()
            };
            witnessMock = {
                duplicate: sinon.spy()
            };
            outbrainMock = {
                init: sinon.spy()
            };
            quizMock = {
                init: sinon.spy()
            };
            membershipMock = {
                init: sinon.spy()
            };
            youtubeMock = {
                init: sinon.spy()
            };
            sandbox = sinon.sandbox.create();
            injector = new Squire();
            window.applyNativeFunctionCall = sinon.spy();
        });

        afterEach(function () {
            sandbox.restore();
            delete window.applyNativeFunctionCall;
        });

        describe('init()', function () {
            it('initialise twitter and witness modules', function (done) {
               injector
                    .mock('modules/twitter', twitterMock)
                    .mock('modules/witness', witnessMock)
                    .mock('modules/outbrain', outbrainMock)
                    .mock('modules/quiz', quizMock)
                    .mock('modules/membership', membershipMock)
                    .mock('modules/youtube', youtubeMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/article'], function (article) {
                        article.init();

                        expect(twitterMock.init).to.have.been.calledOnce;
                        expect(witnessMock.duplicate).to.have.been.calledOnce;

                        done();
                    });
            });

            it('applies native function call articleOutbrainInserter', function (done) {
               injector
                    .mock('modules/twitter', twitterMock)
                    .mock('modules/witness', witnessMock)
                    .mock('modules/outbrain', outbrainMock)
                    .mock('modules/quiz', quizMock)
                    .mock('modules/membership', membershipMock)
                    .mock('modules/youtube', youtubeMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/article'], function (article) {
                        article.init();

                        expect(window.applyNativeFunctionCall).to.have.been.calledWith('articleOutbrainInserter');

                        done();
                    });
            });
        });
    });
});