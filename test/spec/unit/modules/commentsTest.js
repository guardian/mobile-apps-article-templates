define([
    'squire'
], function (
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/modules/comments', function () {
        var clock,
            comments,
            sandbox,
            container;

        var utilMock,
            relativeDatesMock;

        beforeEach(function (done) {
            var injector = new Squire();

            sandbox = sinon.sandbox.create();

            clock = sinon.useFakeTimers();

            container = document.createElement('div');
            container.id = 'container';
            document.body.appendChild(container);

            window.applyNativeFunctionCall = sandbox.spy();

            relativeDatesMock = {
                init: sandbox.spy()
            };
            utilMock = {

            };

            injector
                .mock('modules/relativeDates', relativeDatesMock)
                .mock('modules/util', utilMock)
                .require(['ArticleTemplates/assets/js/modules/comments'], function (sut) {
                    comments = sut;

                    done();
                });
        });

        afterEach(function () {
            document.body.removeChild(container);

            delete window.applyNativeFunctionCall;

            sandbox.restore();
            clock.restore();
        });

        describe('init()', function () {
            it('sets up global functions', function () {
                comments.init();

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

            it('show empty comments block if no html available', function () {
                var emptyCommentBlock = document.createElement('div');

                emptyCommentBlock.classList.add('comments__block--empty');
                emptyCommentBlock.style.display = 'none';

                container.appendChild(emptyCommentBlock);

                comments.init();

                window.articleCommentsInserter('');

                expect(emptyCommentBlock.style.display).to.not.eql('none');
            });

            describe('adds html to the page and calls commentsReplyFormatting', function () {
                var buildDiscussionBlockElem = function (checked, childCount) {
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

                it('adds html to the page and calls window.commentsReplyFormatting', function () {
                    var commentElem = document.createElement('div'),
                        commentsContainer = document.createElement('div');

                    commentElem.innerText = 'Hello World';

                    commentsContainer.classList.add('comments__container');

                    container.appendChild(commentsContainer);

                    comments.init();

                    utilMock.getElemsFromHTML = sandbox.stub().returns([commentElem]);

                    window.articleCommentsInserter(commentElem.outerHTML);

                    expect(commentsContainer.firstChild.innerText).to.eql('Hello World');
                });

                it('add more replies button if discussion block has not been checked and has more than 5 chidren', function () {
                    var moreRepliesButton,
                        discussionBlockElem = buildDiscussionBlockElem(false, 10);

                    container.appendChild(discussionBlockElem);

                    comments.init();

                    window.articleCommentsInserter('<div>Hello World</div>');

                    moreRepliesButton = discussionBlockElem.getElementsByClassName('more--comments')[0];

                    expect(moreRepliesButton).to.not.be.undefined;
                    expect(moreRepliesButton.getElementsByClassName('more__text')[0].innerText).to.eql('6 more replies');
                    expect(discussionBlockElem.classList.contains('block--discussion-thread--checked')).to.eql(true);
                });

                it('does not add more replies button if discussion block has been checked', function () {
                    var moreRepliesButton,
                        discussionBlockElem = buildDiscussionBlockElem(true, 10);

                    container.appendChild(discussionBlockElem);

                    comments.init();

                    window.articleCommentsInserter('<div>Hello World</div>');

                    moreRepliesButton = discussionBlockElem.getElementsByClassName('more--comments')[0];

                    expect(moreRepliesButton).to.be.undefined;
                });

                it('does not add more replies button if discussion block has less than 5 children', function () {
                    var moreRepliesButton,
                        discussionBlockElem = buildDiscussionBlockElem(false, 4);

                    container.appendChild(discussionBlockElem);

                    comments.init();

                    window.articleCommentsInserter('<div>Hello World</div>');

                    moreRepliesButton = discussionBlockElem.getElementsByClassName('more--comments')[0];

                    expect(moreRepliesButton).to.be.undefined;
                    expect(discussionBlockElem.classList.contains('block--discussion-thread--checked')).to.eql(true);
                });

                it('adds orphan class to block if it has 5 children', function () {
                    var discussionBlockElem = buildDiscussionBlockElem(false, 5);

                    container.appendChild(discussionBlockElem);

                    comments.init();

                    window.articleCommentsInserter('<div>Hello World</div>');

                    expect(discussionBlockElem.classList.contains('block--discussion-thread--orphan')).to.eql(true);
                    expect(discussionBlockElem.classList.contains('block--discussion-thread--checked')).to.eql(true);
                });

                it('can handle click on more replies button', function () {
                    var event,
                        moreRepliesButton,
                        discussionBlockElem = buildDiscussionBlockElem(false, 10);

                    container.appendChild(discussionBlockElem);

                    comments.init();

                    window.articleCommentsInserter('<div>Hello World</div>');

                    moreRepliesButton = discussionBlockElem.getElementsByClassName('more--comments')[0];
                    moreRepliesButton.style.display = 'block';

                    event = document.createEvent('HTMLEvents');
                    event.initEvent('click', true, true);
                    moreRepliesButton.dispatchEvent(event);

                    clock.tick(500);

                    expect(moreRepliesButton.style.display).to.eql('none');
                    expect(discussionBlockElem.classList.contains('expand')).to.eql(true);
                });

                it('ignores click on comment child which matches querySelector: a', function () {
                    var event,
                        childElem,
                        commentElem = document.createElement('div'),
                        commentContainer = document.createElement('div');

                    commentElem.innerHTML = '<div class="comment visible comment--open"><a></a></div>';

                    commentContainer.classList.add('comments__container');
                    container.appendChild(commentContainer);

                    comments.init();

                    utilMock.getElemsFromHTML = sandbox.stub().returns([commentElem]);

                    comments.init();

                    window.articleCommentsInserter(commentElem.outerHTML);

                    childElem = commentElem.querySelector('a');
                    event = document.createEvent('HTMLEvents');
                    event.initEvent('click', true, true);
                    childElem.dispatchEvent(event);

                    clock.tick(500);

                    expect(commentElem.firstElementChild.classList.contains('comment--open')).to.eql(true);
                });

                it('ignores click on comment child which matches querySelector: .more--comments', function () {
                    var event,
                        childElem,
                        commentElem = document.createElement('div'),
                        commentContainer = document.createElement('div');

                    commentElem.innerHTML = '<div class="comment visible comment--open"><div class="more--comments"></div></div>';

                    commentContainer.classList.add('comments__container');
                    container.appendChild(commentContainer);

                    comments.init();

                    utilMock.getElemsFromHTML = sandbox.stub().returns([commentElem]);

                    comments.init();

                    window.articleCommentsInserter(commentElem.outerHTML);

                    childElem = commentElem.querySelector('.more--comments');
                    event = document.createEvent('HTMLEvents');
                    event.initEvent('click', true, true);
                    childElem.dispatchEvent(event);

                    clock.tick(500);

                    expect(commentElem.firstElementChild.classList.contains('comment--open')).to.eql(true);
                });

                it('ignores click on comment child which matches querySelector: .comment__reply', function () {
                    var event,
                        childElem,
                        commentElem = document.createElement('div'),
                        commentContainer = document.createElement('div');

                    commentElem.innerHTML = '<div class="comment visible comment--open"><div class="comment__reply"></div></div>';

                    commentContainer.classList.add('comments__container');
                    container.appendChild(commentContainer);

                    comments.init();

                    utilMock.getElemsFromHTML = sandbox.stub().returns([commentElem]);

                    comments.init();

                    window.articleCommentsInserter(commentElem.outerHTML);

                    childElem = commentElem.querySelector('.comment__reply');
                    event = document.createEvent('HTMLEvents');
                    event.initEvent('click', true, true);
                    childElem.dispatchEvent(event);

                    clock.tick(500);

                    expect(commentElem.firstElementChild.classList.contains('comment--open')).to.eql(true);
                });

                it('ignores click on comment child which matches querySelector: .comment__recommend', function () {
                    var event,
                        childElem,
                        commentElem = document.createElement('div'),
                        commentContainer = document.createElement('div');

                    commentElem.innerHTML = '<div class="comment visible comment--open"><div class="comment__recommend"></div></div>';

                    commentContainer.classList.add('comments__container');
                    container.appendChild(commentContainer);

                    comments.init();

                    utilMock.getElemsFromHTML = sandbox.stub().returns([commentElem]);

                    comments.init();

                    window.articleCommentsInserter(commentElem.outerHTML);

                    childElem = commentElem.querySelector('.comment__recommend');
                    event = document.createEvent('HTMLEvents');
                    event.initEvent('click', true, true);
                    childElem.dispatchEvent(event);

                    clock.tick(500);

                    expect(commentElem.firstElementChild.classList.contains('comment--open')).to.eql(true);
                });

                it('can handle click on comment child which matches querySelector: .comment__header', function () {
                    var event,
                        childElem,
                        commentElem = document.createElement('div'),
                        commentContainer = document.createElement('div');

                    commentElem.innerHTML = '<div class="comment visible comment--open"><div class="comment__header"></div></div>';

                    commentContainer.classList.add('comments__container');
                    container.appendChild(commentContainer);

                    comments.init();

                    utilMock.getElemsFromHTML = sandbox.stub().returns([commentElem]);

                    window.articleCommentsInserter(commentElem.outerHTML);
                    
                    childElem = commentElem.querySelector('.comment__header');
                    event = document.createEvent('HTMLEvents');
                    event.initEvent('click', true, true);
                    childElem.dispatchEvent(event);

                    clock.tick(500);

                    expect(commentElem.firstElementChild.classList.contains('comment--open')).to.eql(false);
                });

                it('can handle click on comment child which matches querySelector: .comment__body', function () {
                    var event,
                        childElem,
                        commentElem = document.createElement('div'),
                        commentContainer = document.createElement('div');

                    commentElem.innerHTML = '<div class="comment visible comment--open"><div class="comment__body"></div></div>';

                    commentContainer.classList.add('comments__container');
                    container.appendChild(commentContainer);

                    comments.init();

                    utilMock.getElemsFromHTML = sandbox.stub().returns([commentElem]);

                    window.articleCommentsInserter(commentElem.outerHTML);

                    childElem = commentElem.querySelector('.comment__body');
                    event = document.createEvent('HTMLEvents');
                    event.initEvent('click', true, true);
                    childElem.dispatchEvent(event);

                    clock.tick(500);

                    expect(commentElem.firstElementChild.classList.contains('comment--open')).to.eql(false);
                });

                it('can close other comments on click if they are open', function () {
                    var event,
                        childElem,
                        commentElem = document.createElement('div'),
                        otherCommentElem = document.createElement('div'),
                        commentContainer = document.createElement('div');

                    commentElem.innerHTML = '<div class="comment visible"><div class="comment__header"></div></div>'; 
                    otherCommentElem.innerHTML = '<div class="comment visible comment--open"><div class="comment__header"></div></div>';

                    commentContainer.classList.add('comments__container');
                    container.appendChild(commentContainer);

                    comments.init();

                    utilMock.getElemsFromHTML = sandbox.stub().returns([commentElem, otherCommentElem]);

                    window.articleCommentsInserter(commentElem.outerHTML + otherCommentElem.outerHTML);

                    childElem = commentElem.querySelector('.comment__header');
                    event = document.createEvent('HTMLEvents');
                    event.initEvent('click', true, true);
                    childElem.dispatchEvent(event);

                    clock.tick(500);

                    expect(otherCommentElem.firstElementChild.classList.contains('comment--open')).to.eql(false);
                    expect(commentElem.firstElementChild.classList.contains('comment--open')).to.eql(true);
                });
            });
        });

        describe('window.commentsInserter(html)', function () {
            it('if no html show emptyBlock and hode loadingBlock', function () {
                var emptyCommentBlock = document.createElement('div'),
                    loadingBlock = document.createElement('div');

                loadingBlock.classList.add('comments__block--loading');

                container.appendChild(loadingBlock);

                emptyCommentBlock.classList.add('comments__block--empty');
                emptyCommentBlock.style.display = 'none';

                container.appendChild(emptyCommentBlock);

                comments.init();

                window.commentsInserter('');

                expect(loadingBlock.style.display).to.eql('none');
                expect(emptyCommentBlock.style.display).to.not.eql('none');
            });
        });

        describe('window.articleCommentsFailed()', function () {
            it('if comments fail to load show failed comments block', function () {
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
            });
        });

        describe('window.commentsFailed()', function () {
            it('if comments fail to load show failed comments block', function () {
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
            });
        });

        describe('window.commentsEnd()', function () {
            it('removes loadingBlock', function () {
                var loadingBlock = document.createElement('div');

                container.appendChild(loadingBlock);

                comments.init();

                window.commentsEnd();

                expect(loadingBlock.parentNode).to.be.falsy;
            });
        });

        describe('window.commentsClosed()', function () {
            it('marks comments as closed', function () {
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
            });
        });

        describe('window.commentsOpen()', function () {
            it('marks comments as open', function () {
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
            });
        });

        describe('window.commentTime()', function () {
            it('marks comments as open', function () {
                comments.init();

                window.commentTime();

                expect(relativeDatesMock.init).to.have.been.called;
                expect(relativeDatesMock.init).to.have.been.calledWith('.comment__timestamp', 'title');
            });
        });

        describe('window.commentsRecommendIncrease(id, number)', function () {
            it('marks comments as open', function () {
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
            });
        });

        describe('window.commentsRecommendDecrease(id, number)', function () {
            it('marks comments as open', function () {
                var commentElem = document.createElement('div'),
                    commentReccomends = document.createElement('div'),
                    commentReccomendsCount = document.createElement('div');

                commentElem.id = 'xxx';

                comments.init();

                commentReccomends.classList.add('comment__recommend');
                commentReccomends.classList.add('increase');

                commentReccomendsCount.classList.add('comment__recommend__count');

                commentReccomends.appendChild(commentReccomendsCount);

                commentElem.appendChild(commentReccomends);

                container.appendChild(commentElem);

                window.commentsRecommendDecrease('xxx', 666);

                expect(commentReccomends.classList.contains('increase')).to.eql(false);
                expect(commentReccomendsCount.innerText).to.eql('666');
            });
        });
    });
});