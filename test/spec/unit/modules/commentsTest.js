define([
    'squire'
], function(
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/modules/comments', function() {
        var sandbox,
            container,
            injector;

        var relativeDatesMock;

        beforeEach(function() {
            container = document.createElement('div');
            container.id = 'container';
            document.body.appendChild(container);

            injector = new Squire();

            sandbox = sinon.sandbox.create();

            window.applyNativeFunctionCall = sinon.spy();

            relativeDatesMock = {
                init: sinon.spy()
            };
        });

        afterEach(function () {
            document.body.removeChild(container);

            delete window.applyNativeFunctionCall;

            sandbox.restore();
        });

        describe('init()', function () {
            it('sets up global functions', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        comments.init();

                        expect(window.commentsReplyFormatting).to.not.be.undefined;
                        expect(window.articleCommentsInserter).to.not.be.undefined;
                        expect(window.commentsInserter).to.not.be.undefined;
                        expect(window.articleCommentsFailed).to.not.be.undefined;
                        expect(window.commentsFailed).to.not.be.undefined;
                        expect(window.commentsEnd).to.not.be.undefined;
                        expect(window.commentsClosed).to.not.be.undefined;
                        expect(window.commentsOpen).to.not.be.undefined;
                        expect(window.commentTime).to.not.be.undefined;
                        expect(window.commentsRecommendIncrease).to.not.be.undefined;
                        expect(window.commentsRecommendDecrease).to.not.be.undefined;

                        expect(window.applyNativeFunctionCall).to.have.been.calledWith('articleCommentsInserter');
                        expect(window.applyNativeFunctionCall).to.have.been.calledWith('commentsInserter');
                        expect(window.applyNativeFunctionCall).to.have.been.calledWith('commentsFailed');
                        expect(window.applyNativeFunctionCall).to.have.been.calledWith('commentsClosed');
                        expect(window.applyNativeFunctionCall).to.have.been.calledWith('commentsOpen');
                        expect(window.applyNativeFunctionCall).to.have.been.calledWith('articleCommentsFailed');

                        done();
                    });
            });
        });

        describe('window.commentsReplyFormatting', function () {
            var buildDiscussionBlockElem = function(checked, childCount) {
                var i,
                    childElem,
                    discussionBlockElem = document.createElement('div');
                
                discussionBlockElem.classList.add('block--discussion-thread');
                
                if (checked) {
                    discussionBlockElem.classList.add('block--discussion-thread--checked');
                }

                for (i = 0; i < childCount; i++) {
                    childElem = document.createElement('div');
                    childElem.id = 'child' + i;
                    discussionBlockElem.appendChild(childElem);
                }

                return discussionBlockElem;
            };

            it('add more replies button if discussion block has not been checked and has more than 5 chidren', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        var moreRepliesButton,
                            discussionBlockElem = buildDiscussionBlockElem(false, 10);

                        container.appendChild(discussionBlockElem);

                        comments.init();

                        window.commentsReplyFormatting();

                        moreRepliesButton = discussionBlockElem.getElementsByClassName('more--comments')[0];

                        expect(moreRepliesButton).to.not.be.undefined;
                        expect(moreRepliesButton.getElementsByClassName('more__text')[0].innerText).to.eql('6 more replies');
                        expect(discussionBlockElem.classList.contains('block--discussion-thread--checked')).to.eql(true);

                        done();
                    });
            });

            it('does not add more replies button if discussion block has been checked', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        var moreRepliesButton,
                            discussionBlockElem = buildDiscussionBlockElem(true, 10);

                        container.appendChild(discussionBlockElem);

                        comments.init();

                        window.commentsReplyFormatting();

                        moreRepliesButton = discussionBlockElem.getElementsByClassName('more--comments')[0];

                        expect(moreRepliesButton).to.be.undefined;

                        done();
                    });
            });

            it('does not add more replies button if discussion block has less than 5 children', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        var moreRepliesButton,
                            discussionBlockElem = buildDiscussionBlockElem(false, 4);

                        container.appendChild(discussionBlockElem);

                        comments.init();

                        window.commentsReplyFormatting();

                        moreRepliesButton = discussionBlockElem.getElementsByClassName('more--comments')[0];

                        expect(moreRepliesButton).to.be.undefined;
                        expect(discussionBlockElem.classList.contains('block--discussion-thread--checked')).to.eql(true);

                        done();
                    });
            });

            it('adds orphan class to block if it has 5 children', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        var discussionBlockElem = buildDiscussionBlockElem(false, 5);

                        container.appendChild(discussionBlockElem);

                        comments.init();

                        window.commentsReplyFormatting();

                        expect(discussionBlockElem.classList.contains('block--discussion-thread--orphan')).to.eql(true);
                        expect(discussionBlockElem.classList.contains('block--discussion-thread--checked')).to.eql(true);

                        done();
                    });
            });

            it('can handle click on more replies button', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        var event,
                            moreRepliesButton,
                            discussionBlockElem = buildDiscussionBlockElem(false, 10);

                        container.appendChild(discussionBlockElem);

                        comments.init();

                        window.commentsReplyFormatting();

                        moreRepliesButton = discussionBlockElem.getElementsByClassName('more--comments')[0];
                        moreRepliesButton.style.display = 'block';

                        event = document.createEvent('HTMLEvents');
                        event.initEvent('click', true, true);
                        moreRepliesButton.dispatchEvent(event);

                        setTimeout(function () {
                            expect(moreRepliesButton.style.display).to.eql('none');
                            expect(discussionBlockElem.classList.contains('expand')).to.eql(true);

                            done();
                        }, 500);
                    });
            });

            it('ignores click on comment child which matches querySelector: a', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        var event,
                            commentElem = document.createElement('div'),
                            childElem = document.createElement('a');

                        commentElem.classList.add('comment');
                        commentElem.classList.add('visible');
                        commentElem.classList.add('comment--open');

                        commentElem.appendChild(childElem);

                        container.appendChild(commentElem);

                        comments.init();

                        window.commentsReplyFormatting();

                        event = document.createEvent('HTMLEvents');
                        event.initEvent('click', true, true);
                        childElem.dispatchEvent(event);

                        setTimeout(function () {
                            expect(commentElem.classList.contains('comment--open')).to.eql(true);

                            done();
                        }, 500);
                    });
            });

            it('ignores click on comment child which matches querySelector: .more--comments', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        var event,
                            commentElem = document.createElement('div'),
                            childElem = document.createElement('div');

                        commentElem.classList.add('comment');
                        commentElem.classList.add('visible');
                        commentElem.classList.add('comment--open');

                        childElem.classList.add('more--comments');
                        commentElem.appendChild(childElem);

                        container.appendChild(commentElem);

                        comments.init();

                        window.commentsReplyFormatting();

                        event = document.createEvent('HTMLEvents');
                        event.initEvent('click', true, true);
                        childElem.dispatchEvent(event);

                        setTimeout(function () {
                            expect(commentElem.classList.contains('comment--open')).to.eql(true);

                            done();
                        }, 500);
                    });
            });

            it('ignores click on comment child which matches querySelector: .comment__reply', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        var event,
                            commentElem = document.createElement('div'),
                            childElem = document.createElement('div');

                        commentElem.classList.add('comment');
                        commentElem.classList.add('visible');
                        commentElem.classList.add('comment--open');

                        childElem.classList.add('comment__reply');
                        commentElem.appendChild(childElem);

                        container.appendChild(commentElem);

                        comments.init();

                        window.commentsReplyFormatting();

                        event = document.createEvent('HTMLEvents');
                        event.initEvent('click', true, true);
                        childElem.dispatchEvent(event);

                        setTimeout(function () {
                            expect(commentElem.classList.contains('comment--open')).to.eql(true);

                            done();
                        }, 500);
                    });
            });

            it('ignores click on comment child which matches querySelector: .comment__recommend', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        var event,
                            commentElem = document.createElement('div'),
                            childElem = document.createElement('div');

                        commentElem.classList.add('comment');
                        commentElem.classList.add('visible');
                        commentElem.classList.add('comment--open');

                        childElem.classList.add('comment__recommend');
                        commentElem.appendChild(childElem);

                        container.appendChild(commentElem);

                        comments.init();

                        window.commentsReplyFormatting();

                        event = document.createEvent('HTMLEvents');
                        event.initEvent('click', true, true);
                        childElem.dispatchEvent(event);

                        setTimeout(function () {
                            expect(commentElem.classList.contains('comment--open')).to.eql(true);

                            done();
                        }, 500);
                    });
            });

            it('can handle click on comment child which matches querySelector: .comment__header', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        var event,
                            commentElem = document.createElement('div'),
                            childElem = document.createElement('div');

                        commentElem.classList.add('comment');
                        commentElem.classList.add('visible');
                        commentElem.classList.add('comment--open');

                        childElem.classList.add('comment__header');
                        commentElem.appendChild(childElem);

                        container.appendChild(commentElem);

                        comments.init();

                        window.commentsReplyFormatting();

                        event = document.createEvent('HTMLEvents');
                        event.initEvent('click', true, true);
                        childElem.dispatchEvent(event);

                        setTimeout(function () {
                            expect(commentElem.classList.contains('comment--open')).to.eql(false);

                            done();
                        }, 500);
                    });
            });

            it('can handle click on comment child which matches querySelector: .comment__body', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        var event,
                            commentElem = document.createElement('div'),
                            childElem = document.createElement('div');

                        commentElem.classList.add('comment');
                        commentElem.classList.add('visible');
                        commentElem.classList.add('comment--open');

                        childElem.classList.add('comment__body');
                        commentElem.appendChild(childElem);

                        container.appendChild(commentElem);

                        comments.init();

                        window.commentsReplyFormatting();

                        event = document.createEvent('HTMLEvents');
                        event.initEvent('click', true, true);
                        childElem.dispatchEvent(event);

                        setTimeout(function () {
                            expect(commentElem.classList.contains('comment--open')).to.eql(false);

                            done();
                        }, 500);
                    });
            });

            it('can close comment on click if comment is open', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        var event,
                            commentElem = document.createElement('div'),
                            otherCommentElem = document.createElement('div'),
                            childElem = document.createElement('div');

                        commentElem.classList.add('comment');
                        commentElem.classList.add('visible');
                        
                        otherCommentElem.classList.add('comment');
                        otherCommentElem.classList.add('comment--open');

                        childElem.classList.add('comment__body');
                        commentElem.appendChild(childElem);

                        container.appendChild(commentElem);
                        container.appendChild(otherCommentElem);

                        comments.init();

                        window.commentsReplyFormatting();

                        event = document.createEvent('HTMLEvents');
                        event.initEvent('click', true, true);
                        childElem.dispatchEvent(event);

                        setTimeout(function () {
                            expect(otherCommentElem.classList.contains('comment--open')).to.eql(false);
                            expect(commentElem.classList.contains('comment--open')).to.eql(true);

                            done();
                        }, 500);
                    });
            });
        });

        describe('window.articleCommentsInserter(html)', function () {
            var loadingBlock; 

            beforeEach(function () {
                loadingBlock = document.createElement('div');

                loadingBlock.classList.add('comments__block--loading');

                container.appendChild(loadingBlock);
            });

            afterEach(function () {
                expect(loadingBlock.style.display).to.equal('none');
            });

            it('show empty comments block if no html available', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        var emptyCommentBlock = document.createElement('div');

                        emptyCommentBlock.classList.add('comments__block--empty');
                        emptyCommentBlock.style.display = 'none';

                        container.appendChild(emptyCommentBlock);

                        comments.init();

                        window.articleCommentsInserter('');

                        expect(emptyCommentBlock.style.display).to.not.eql('none');
                        
                        done();
                    });
            });

            it('adds html to the page and calls window.commentsReplyFormatting', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        var commentsContainer = document.createElement('div');

                        commentsContainer.classList.add('comments__container');
                
                        container.appendChild(commentsContainer);

                        comments.init();

                        window.commentsReplyFormatting = sinon.spy();

                        window.articleCommentsInserter('<div>Hello World</div>');

                        expect(commentsContainer.firstChild.innerText).to.eql('Hello World');
                        expect(window.commentsReplyFormatting).to.have.been.calledOnce;

                        done();
                    });
            });
        });

        describe('window.commentsInserter(html)', function () {
            it('if no html show emptyBlock and hode loadingBlock', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        var emptyCommentBlock = document.createElement('div'),
                            loadingBlock = document.createElement('div');

                        loadingBlock.classList.add('comments__block--loading');

                        container.appendChild(loadingBlock);

                        emptyCommentBlock.classList.add('comments__block--empty');
                        emptyCommentBlock.style.display = 'none';

                        container.appendChild(emptyCommentBlock);

                        comments.init();

                        window.articleCommentsInserter('');

                        expect(loadingBlock.style.display).to.eql('none');
                        expect(emptyCommentBlock.style.display).to.not.eql('none');

                        done();
                    });
            });

            it('if html add to container', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        var commentsContainer = document.createElement('div'),
                            loadingBlock = document.createElement('div');

                        loadingBlock.classList.add('comments__block--loading');

                        container.appendChild(loadingBlock);

                        commentsContainer.classList.add('comments__container');
                
                        container.appendChild(commentsContainer);

                        comments.init();

                        window.commentsReplyFormatting = sinon.spy();

                        window.commentsInserter('<div>Hello World</div>');

                        expect(commentsContainer.firstChild.innerText).to.eql('Hello World');
                        expect(window.commentsReplyFormatting).to.have.been.calledOnce;
                        expect(commentsContainer.childNodes[1]).to.eql(loadingBlock);

                        done();
                    });
            });
        });

        describe('window.articleCommentsFailed()', function () {
            it('if comments fail to load show failed comments block', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        var commentsElem = document.createElement('div'),
                            failedBlock = document.createElement('div'),
                            loadingBlock = document.createElement('div');

                        commentsElem.classList.add('comments');

                        container.appendChild(commentsElem);  

                        loadingBlock.classList.add('comments__block--loading');

                        container.appendChild(loadingBlock);

                        failedBlock.classList.add('comments__block--failed');
                        failedBlock.style.display = 'none';

                        container.appendChild(failedBlock);

                        comments.init();

                        window.articleCommentsFailed();

                        expect(loadingBlock.style.display).to.eql('none');
                        expect(failedBlock.style.display).to.not.eql('none');
                        expect(commentsElem.classList.contains('comments-has-failed')).to.eql(true);

                        done();
                    });
            });
        });

        describe('window.commentsFailed()', function () {
            it('if comments fail to load show failed comments block', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        var commentsElem = document.createElement('div'),
                            failedBlock = document.createElement('div'),
                            loadingBlock = document.createElement('div');

                        commentsElem.classList.add('comments');

                        container.appendChild(commentsElem);  

                        loadingBlock.classList.add('comments__block--loading');

                        container.appendChild(loadingBlock);

                        failedBlock.classList.add('comments__block--failed');
                        failedBlock.style.display = 'none';

                        container.appendChild(failedBlock);

                        comments.init();

                        window.commentsFailed();

                        expect(loadingBlock.style.display).to.eql('none');
                        expect(failedBlock.style.display).to.not.eql('none');
                        expect(commentsElem.classList.contains('comments-has-failed')).to.eql(true);

                        done();
                    });
            });
        });

        describe('window.commentsEnd()', function () {
            it('removes loadingBlock', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        var loadingBlock = document.createElement('div');

                        container.appendChild(loadingBlock);

                        comments.init();

                        window.commentsEnd();

                        expect(loadingBlock.parentNode).to.be.falsy;
                       
                        done();
                    });
            });
        });

        describe('window.commentsClosed()', function () {
            it('marks comments as closed', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        var discussionElem = document.createElement('div'),
                            commentsElem = document.createElement('div');

                        discussionElem.id = 'discussion';

                        container.appendChild(discussionElem);

                        commentsElem.classList.add('comments');

                        container.appendChild(commentsElem);

                        comments.init();

                        window.commentsClosed();

                        expect(discussionElem.classList.contains('comments--closed')).to.eql(true);
                        expect(commentsElem.classList.contains('comments--closed')).to.eql(true);
                       
                        done();
                    });
            });
        });

        describe('window.commentsOpen()', function () {
            it('marks comments as open', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        var discussionElem = document.createElement('div'),
                            commentsElem = document.createElement('div');

                        discussionElem.id = 'discussion';

                        container.appendChild(discussionElem);

                        commentsElem.classList.add('comments');

                        container.appendChild(commentsElem);

                        comments.init();

                        window.commentsOpen();

                        expect(discussionElem.classList.contains('comments--open')).to.eql(true);
                        expect(commentsElem.classList.contains('comments--open')).to.eql(true);
                       
                        done();
                    });
            });
        });

        describe('window.commentTime()', function () {
            it('marks comments as open', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        comments.init();

                        window.commentTime();

                        expect(relativeDatesMock.init).to.have.been.called;
                        expect(relativeDatesMock.init).to.have.been.calledWith('.comment__timestamp', 'title');
                        
                        done();
                    });
            });
        });

        describe('window.commentsRecommendIncrease(id, number)', function () {
            it('marks comments as open', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        var commentElem = document.createElement('div'),
                            commentReccomends = document.createElement('div'),
                            commentReccomendsCount = document.createElement('div');

                        commentElem.id = 'xxx';

                        comments.init();

                        commentReccomends.classList.add('comment__recommend');

                        commentReccomendsCount.classList.add('comment__recommend__count');

                        commentReccomends.appendChild(commentReccomendsCount);

                        commentElem.appendChild(commentReccomends);

                        container.appendChild(commentElem);

                        window.commentsRecommendIncrease('xxx', 666);

                        expect(commentReccomends.classList.contains('increase')).to.eql(true);
                        expect(commentReccomendsCount.innerText).to.eql('666');
                        
                        done();
                    });
            });
        });

        describe('window.commentsRecommendDecrease(id, number)', function () {
            it('marks comments as open', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .require(['ArticleTemplates/assets/js/modules/comments'], function (comments) {
                        var commentElem = document.createElement('div'),
                            commentReccomends = document.createElement('div'),
                            commentReccomendsCount = document.createElement('div');

                        commentElem.id = 'xxx';

                        comments.init();

                        commentReccomends.classList.add('comment__recommend');
                        commentReccomends.classList.add('increase')

                        commentReccomendsCount.classList.add('comment__recommend__count');

                        commentReccomends.appendChild(commentReccomendsCount);

                        commentElem.appendChild(commentReccomends);

                        container.appendChild(commentElem);

                        window.commentsRecommendDecrease('xxx', 666);

                        expect(commentReccomends.classList.contains('increase')).to.eql(false);
                        expect(commentReccomendsCount.innerText).to.eql('666');
                        
                        done();
                    });
            });
        });           
    });
});