define([
    'squire'
], function(
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/bootstraps/article', function() {
        var injector,
            sandbox;
            
        var twitterMock,
            witnessMock,
            outbrainMock,
            quizMock,
            membershipMock;

        beforeEach(function() {
            twitterMock = {
                init: sinon.spy(),
                enhanceTweets: sinon.spy()
            };
            witnessMock = {
                duplicate: sinon.spy()
            };
            outbrainMock = {
                load: sinon.spy()
            };
            quizMock = {
                init: sinon.spy()
            },
            membershipMock = {
                init: sinon.spy()
            },
            sandbox = sinon.sandbox.create();
            injector = new Squire();
        });

        afterEach(function () {
            sandbox.restore();
        });

        describe('article.init()', function () {
            it('init article', function (done) {
               injector
                    .mock('modules/twitter', twitterMock)
                    .mock('modules/witness', witnessMock)
                    .mock('modules/outbrain', outbrainMock)
                    .mock('modules/quiz', quizMock)
                    .mock('modules/membership', membershipMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/article'], function (article) {
                        sandbox.stub(article, 'insertOutbrain');
                        sandbox.stub(article, 'loadQuizzes');
                        sandbox.stub(article, 'formatImmersive');
                        sandbox.stub(article, 'richLinkTracking');
                        sandbox.stub(article, 'addMembershipCreative');

                        article.init();

                        expect(twitterMock.init).to.have.been.calledOnce;
                        expect(twitterMock.enhanceTweets).to.have.been.calledOnce;
                        expect(witnessMock.duplicate).to.have.been.calledOnce;
                        expect(article.insertOutbrain).to.have.been.calledOnce;
                        expect(article.loadQuizzes).to.have.been.calledOnce;
                        expect(article.formatImmersive).to.have.been.calledOnce;
                        expect(article.richLinkTracking).to.have.been.calledOnce;
                        expect(article.addMembershipCreative).to.have.been.calledOnce;

                        done();
                    });
            });
        });
    });
});