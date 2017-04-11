define([
    'squire'
], function (
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/bootstraps/article', function(done) {
        var article,
            sandbox;
            
        var youtubeMock,
            twitterMock,
            witnessMock,
            outbrainMock,
            quizMock,
            creativeInjectorMock,
            immersiveMock;

        beforeEach(function (done) {
            var injector = new Squire();
            
            sandbox = sinon.sandbox.create();

            twitterMock = {
                init: sandbox.spy()
            };
            witnessMock = {
                init: sandbox.spy()
            };
            outbrainMock = {
                init: sandbox.spy()
            };
            quizMock = {
                init: sandbox.spy()
            };
            creativeInjectorMock = {
                init: sandbox.spy()
            };
            youtubeMock = {
                init: sandbox.spy()
            };
            immersiveMock = {
                init: sandbox.spy()
            };
            
            window.GU = {
                opts: {
                    isImmersive: false
                }
            };

            window.applyNativeFunctionCall = sandbox.spy();

            injector
                .mock('modules/twitter', twitterMock)
                .mock('modules/witness', witnessMock)
                .mock('modules/outbrain', outbrainMock)
                .mock('modules/quiz', quizMock)
                .mock('modules/creativeInjector', creativeInjectorMock)
                .mock('modules/youtube', youtubeMock)
                .mock('modules/immersive', immersiveMock)
                .require(['ArticleTemplates/assets/js/bootstraps/article'], function (sut) {
                    article = sut;

                    done();
                });
        });

        afterEach(function () {
            delete window.applyNativeFunctionCall;
            delete window.GU;
            sandbox.restore();
        });

        describe('init()', function () {
            it('initialise twitter and witness modules', function () {
                article.init();

                expect(twitterMock.init).to.have.been.calledOnce;
                expect(witnessMock.init).to.have.been.calledOnce;
            });

            it('applies native function call articleOutbrainInserter', function () {
                article.init();

                expect(window.applyNativeFunctionCall).to.have.been.calledWith('articleOutbrainInserter');
            });
        });
    });
});