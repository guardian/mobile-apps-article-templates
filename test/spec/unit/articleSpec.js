define([
    'squire'
], function(
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/article', function() {
        var article, injector,
            commonMock, articleMock;

        beforeEach(function() {
            commonMock = {
                init: sinon.spy()
            };
            articleMock = {
                init: sinon.spy()
            };
            injector = new Squire();
        });

        it('article is instance of Article', function (done) {
           injector
                .mock('bootstraps/common', commonMock)
                .mock('bootstraps/article', articleMock)
                .require(['ArticleTemplates/assets/js/article'], function(Article) {
                    article = new Article();

                    expect(article).to.be.instanceOf(Article);

                    done();
                });
        });

    });
});