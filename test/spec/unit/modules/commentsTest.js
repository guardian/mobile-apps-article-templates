define([
    'squire'
], function(
    Squire
) {
    'use strict';

    describe.only('ArticleTemplates/assets/js/modules/comments', function() {
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
    });
});