define([
    'squire'
], function(
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/bootstraps/article', function() {
        var injector;
            
        var youtubeMock,
            twitterMock,
            witnessMock,
            outbrainMock,
            quizMock,
            membershipMock,
            immersiveMock;

        beforeEach(function() {
            twitterMock = {
                init: sinon.spy()
            };
            witnessMock = {
                init: sinon.spy()
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
            immersiveMock = {
                init: sinon.spy()
            };
            
            injector = new Squire();
            
            window.GU = {
                opts: {
                    isImmersive: false
                }
            };

            window.applyNativeFunctionCall = sinon.spy();
        });

        afterEach(function () {
            delete window.applyNativeFunctionCall;
            delete window.GU;
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
                    .mock('modules/immersive', immersiveMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/article'], function (article) {
                        article.init();

                        expect(twitterMock.init).to.have.been.calledOnce;
                        expect(witnessMock.init).to.have.been.calledOnce;

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
                    .mock('modules/immersive', immersiveMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/article'], function (article) {
                        article.init();

                        expect(window.applyNativeFunctionCall).to.have.been.calledWith('articleOutbrainInserter');

                        done();
                    });
            });
        });
    });
});