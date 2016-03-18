define([
    'squire',
    'class'
], function(
    Squire,
    Class
) {
    'use strict';

    describe('ArticleTemplates/assets/js/layouts/Article', function() {
        var article, 
            injector,
            sandbox,
            layoutMock,
            twitterMock,
            witnessMock,
            outbrainMock,
            quizMock;

        beforeEach(function() {
            layoutMock = Class.extend({
                init: sinon.spy()
            });
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
            };
            sandbox = sinon.sandbox.create();
            injector = new Squire();
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('article is instance of Article', function (done) {
           injector
                .mock('layouts/Layout', layoutMock)
                .mock('modules/twitter', twitterMock)
                .mock('modules/witness', witnessMock)
                .mock('modules/outbrain', outbrainMock)
                .mock('modules/quiz', quizMock)
                .require(['ArticleTemplates/assets/js/layouts/Article'], function (Article) {
                    sandbox.stub(Article.prototype, 'insertOutbrain');
                    sandbox.stub(Article.prototype, 'loadQuizzes');
                    sandbox.stub(Article.prototype, 'formatImmersive');
                    sandbox.stub(Article.prototype, 'richLinkTracking');

                    article = new Article();

                    expect(article).to.be.instanceOf(Article);
                    expect(twitterMock.init).to.have.been.calledOnce;
                    expect(twitterMock.enhanceTweets).to.have.been.calledOnce;
                    expect(witnessMock.duplicate).to.have.been.calledOnce;
                    expect(Article.prototype.insertOutbrain).to.have.been.calledOnce;
                    expect(Article.prototype.loadQuizzes).to.have.been.calledOnce;
                    expect(Article.prototype.formatImmersive).to.have.been.calledOnce;
                    expect(Article.prototype.richLinkTracking).to.have.been.calledOnce;

                    done();
                });
        });

    });
});