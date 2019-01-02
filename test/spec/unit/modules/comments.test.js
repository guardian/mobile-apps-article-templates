import { init } from 'modules/comments';
import * as util from 'modules/util';
import * as relativeDates from 'modules/relativeDates';

describe('ArticleTemplates/assets/js/modules/comments', function () {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'container';
        document.body.appendChild(container);
        window.applyNativeFunctionCall = jest.fn();
        const initMock = jest.spyOn(relativeDates, "init");
    });

    afterEach(() => {
        document.body.removeChild(container);
        delete window.applyNativeFunctionCall;
    });

    describe('init()', function () {
        it('sets up global functions', function () {
            init();

            expect(window.articleCommentsInserter).toBeDefined();
            expect(window.commentsInserter).toBeDefined();
            expect(window.articleCommentsFailed).toBeDefined();
            expect(window.commentsFailed).toBeDefined();
            expect(window.commentsEnd).toBeDefined();
            expect(window.commentsClosed).toBeDefined();
            expect(window.commentsOpen).toBeDefined();
            expect(window.commentTime).toBeDefined();
            expect(window.commentsRecommendIncrease).toBeDefined();
            expect(window.commentsRecommendDecrease).toBeDefined();

            expect(window.applyNativeFunctionCall).toHaveBeenCalledWith('articleCommentsInserter');
            expect(window.applyNativeFunctionCall).toHaveBeenCalledWith('commentsInserter');
            expect(window.applyNativeFunctionCall).toHaveBeenCalledWith('commentsFailed');
            expect(window.applyNativeFunctionCall).toHaveBeenCalledWith('commentsClosed');
            expect(window.applyNativeFunctionCall).toHaveBeenCalledWith('commentsOpen');
            expect(window.applyNativeFunctionCall).toHaveBeenCalledWith('articleCommentsFailed');
        });
    });

    describe('window.articleCommentsInserter(html)', function () {
        let loadingBlock;

        beforeEach(() => {
            loadingBlock = document.createElement('div');
            loadingBlock.classList.add('comments__block--loading');
            container.appendChild(loadingBlock);
        });

        afterEach(() => {
            expect(loadingBlock.style.display).toEqual('none');
        });

        it('show empty comments block if no html available', function () {
            let emptyCommentBlock = document.createElement('div');

            emptyCommentBlock.classList.add('comments__block--empty');
            emptyCommentBlock.style.display = 'none';

            container.appendChild(emptyCommentBlock);

            init();

            window.articleCommentsInserter('');

            expect(emptyCommentBlock.style.display).not.toEqual('none');
        });

        describe('adds html to the page and calls commentsReplyFormatting', function () {
            const buildDiscussionBlockElem = function (checked, childCount) {
                let i;
                let childElem;
                let discussionBlockElem = document.createElement('div');

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
                let commentElem = document.createElement('div');
                let commentsContainer = document.createElement('div');

                commentElem.innerText = 'Hello World';

                commentsContainer.classList.add('comments__container');

                container.appendChild(commentsContainer);

                init();

                jest.spyOn(util, 'getElemsFromHTML')
                    .mockImplementation(() => {
                        return [commentElem];
                    });

                window.articleCommentsInserter(commentElem.outerHTML);

                expect(commentsContainer.firstChild.innerText).toEqual('Hello World');
            });

            it('add more replies button if discussion block has not been checked and has more than 5 chidren', function () {
                let moreRepliesButton;
                let discussionBlockElem = buildDiscussionBlockElem(false, 10);

                container.appendChild(discussionBlockElem);

                init();

                window.articleCommentsInserter('<div>Hello World</div>');

                moreRepliesButton = discussionBlockElem.getElementsByClassName('more--comments')[0];

                expect(moreRepliesButton).toBeDefined();
                expect(moreRepliesButton.getElementsByClassName('more__text')[0].innerHTML).toEqual('6 more replies');
                expect(discussionBlockElem.classList.contains('block--discussion-thread--checked')).toEqual(true);
            });

            it('does not add more replies button if discussion block has been checked', function () {
                let moreRepliesButton;
                let discussionBlockElem = buildDiscussionBlockElem(true, 10);

                container.appendChild(discussionBlockElem);

                init();

                window.articleCommentsInserter('<div>Hello World</div>');

                moreRepliesButton = discussionBlockElem.getElementsByClassName('more--comments')[0];

                expect(moreRepliesButton).toBeUndefined();
            });

            it('does not add more replies button if discussion block has less than 5 children', function () {
                let moreRepliesButton;
                let discussionBlockElem = buildDiscussionBlockElem(false, 4);

                container.appendChild(discussionBlockElem);

                init();

                window.articleCommentsInserter('<div>Hello World</div>');

                moreRepliesButton = discussionBlockElem.getElementsByClassName('more--comments')[0];

                expect(moreRepliesButton).toBeUndefined();
                expect(discussionBlockElem.classList.contains('block--discussion-thread--checked')).toEqual(true);
            });

            it('adds orphan class to block if it has 5 children', function () {
                const discussionBlockElem = buildDiscussionBlockElem(false, 5);

                container.appendChild(discussionBlockElem);

                init();

                window.articleCommentsInserter('<div>Hello World</div>');

                expect(discussionBlockElem.classList.contains('block--discussion-thread--orphan')).toEqual(true);
                expect(discussionBlockElem.classList.contains('block--discussion-thread--checked')).toEqual(true);
            });

            it('can handle click on more replies button', function () {
                let event;
                let moreRepliesButton;
                let discussionBlockElem = buildDiscussionBlockElem(false, 10);

                container.appendChild(discussionBlockElem);

                init();

                window.articleCommentsInserter('<div>Hello World</div>');

                moreRepliesButton = discussionBlockElem.getElementsByClassName('more--comments')[0];
                moreRepliesButton.style.display = 'block';

                event = document.createEvent('HTMLEvents');
                event.initEvent('click', true, true);
                moreRepliesButton.dispatchEvent(event);

                expect(moreRepliesButton.style.display).toEqual('none');
                expect(discussionBlockElem.classList.contains('expand')).toEqual(true);
            });

            it('ignores click on comment child which matches querySelector: a', function () {
                let event;
                let childElem;
                let commentElem = document.createElement('div');
                let commentContainer = document.createElement('div');

                commentElem.innerHTML = '<div class="comment visible comment--open"><a></a></div>';

                commentContainer.classList.add('comments__container');
                container.appendChild(commentContainer);

                init();

                jest.spyOn(util, 'getElemsFromHTML')
                    .mockImplementation(() => {
                        return [commentElem];
                    });

                init();

                window.articleCommentsInserter(commentElem.outerHTML);

                childElem = commentElem.querySelector('a');
                event = document.createEvent('HTMLEvents');
                event.initEvent('click', true, true);
                childElem.dispatchEvent(event);

                expect(commentElem.firstElementChild.classList.contains('comment--open')).toEqual(true);
            });

            it('ignores click on comment child which matches querySelector: .more--comments', function () {
                let event;
                let childElem;
                let commentElem = document.createElement('div');
                let commentContainer = document.createElement('div');

                commentElem.innerHTML = '<div class="comment visible comment--open"><div class="more--comments"></div></div>';

                commentContainer.classList.add('comments__container');
                container.appendChild(commentContainer);

                init();

                jest.spyOn(util, 'getElemsFromHTML')
                    .mockImplementation(() => {
                        return [commentElem];
                    });

                init();

                window.articleCommentsInserter(commentElem.outerHTML);

                childElem = commentElem.querySelector('.more--comments');
                event = document.createEvent('HTMLEvents');
                event.initEvent('click', true, true);
                childElem.dispatchEvent(event);

                expect(commentElem.firstElementChild.classList.contains('comment--open')).toEqual(true);
            });

            it('ignores click on comment child which matches querySelector: .comment__reply', function () {
                let event;
                let childElem;
                let commentElem = document.createElement('div');
                let commentContainer = document.createElement('div');

                commentElem.innerHTML = '<div class="comment visible comment--open"><div class="comment__reply"></div></div>';

                commentContainer.classList.add('comments__container');
                container.appendChild(commentContainer);

                init();

                jest.spyOn(util, 'getElemsFromHTML')
                    .mockImplementation(() => {
                        return [commentElem];
                    });

                init();

                window.articleCommentsInserter(commentElem.outerHTML);

                childElem = commentElem.querySelector('.comment__reply');
                event = document.createEvent('HTMLEvents');
                event.initEvent('click', true, true);
                childElem.dispatchEvent(event);

                expect(commentElem.firstElementChild.classList.contains('comment--open')).toEqual(true);
            });

            it('ignores click on comment child which matches querySelector: .comment__recommend', function () {
                let event;
                let childElem;
                let commentElem = document.createElement('div');
                let commentContainer = document.createElement('div');

                commentElem.innerHTML = '<div class="comment visible comment--open"><div class="comment__recommend"></div></div>';

                commentContainer.classList.add('comments__container');
                container.appendChild(commentContainer);

                init();

                window.articleCommentsInserter(commentElem.outerHTML);

                childElem = commentElem.querySelector('.comment__recommend');
                event = document.createEvent('HTMLEvents');
                event.initEvent('click', true, true);
                childElem.dispatchEvent(event);

                expect(commentElem.firstElementChild.classList.contains('comment--open')).toEqual(true);
            });

            it('can handle click on comment child which matches querySelector: .comment__header', function () {
                let event;
                let childElem;
                let commentElem = document.createElement('div');
                let commentContainer = document.createElement('div');

                commentElem.innerHTML = '<div class="comment visible comment--open"><div class="comment__header"></div></div>';

                commentContainer.classList.add('comments__container');
                container.appendChild(commentContainer);

                init();

                jest.spyOn(util, 'getElemsFromHTML')
                    .mockImplementation(() => {
                        return [commentElem];
                    });

                window.articleCommentsInserter(commentElem.outerHTML);
                
                childElem = commentElem.querySelector('.comment__header');
                event = document.createEvent('HTMLEvents');
                event.initEvent('click', true, true);
                childElem.dispatchEvent(event);

                expect(commentElem.firstElementChild.classList.contains('comment--open')).toEqual(false);
            });

            it('can handle click on comment child which matches querySelector: .comment__body', function () {
                let event;
                let childElem;
                let commentElem = document.createElement('div');
                let commentContainer = document.createElement('div');

                commentElem.innerHTML = '<div class="comment visible comment--open"><div class="comment__body"></div></div>';

                commentContainer.classList.add('comments__container');
                container.appendChild(commentContainer);

                init();

                jest.spyOn(util, 'getElemsFromHTML')
                    .mockImplementation(() => {
                        return [commentElem];
                    });

                window.articleCommentsInserter(commentElem.outerHTML);

                childElem = commentElem.querySelector('.comment__body');
                event = document.createEvent('HTMLEvents');
                event.initEvent('click', true, true);
                childElem.dispatchEvent(event);

                expect(commentElem.firstElementChild.classList.contains('comment--open')).toEqual(false);
            });

            it('can close other comments on click if they are open', function () {
                let event;
                let childElem;
                let commentElem = document.createElement('div');
                let otherCommentElem = document.createElement('div');
                let commentContainer = document.createElement('div');

                commentElem.innerHTML = '<div class="comment visible"><div class="comment__header"></div></div>'; 
                otherCommentElem.innerHTML = '<div class="comment visible comment--open"><div class="comment__header"></div></div>';

                commentContainer.classList.add('comments__container');
                container.appendChild(commentContainer);

                init();

                jest.spyOn(util, 'getElemsFromHTML')
                    .mockImplementation(() => {
                        return [commentElem, otherCommentElem];
                    });

                window.articleCommentsInserter(commentElem.outerHTML + otherCommentElem.outerHTML);

                childElem = commentElem.querySelector('.comment__header');
                event = document.createEvent('HTMLEvents');
                event.initEvent('click', true, true);
                childElem.dispatchEvent(event);

                expect(otherCommentElem.firstElementChild.classList.contains('comment--open')).toEqual(false);
                expect(commentElem.firstElementChild.classList.contains('comment--open')).toEqual(true);
            });
        });
    });

    describe('window.commentsInserter(html)', function () {
        it('if no html show emptyBlock and hode loadingBlock', function () {
            let emptyCommentBlock = document.createElement('div');
            let loadingBlock = document.createElement('div');

            loadingBlock.classList.add('comments__block--loading');

            container.appendChild(loadingBlock);

            emptyCommentBlock.classList.add('comments__block--empty');
            emptyCommentBlock.style.display = 'none';

            container.appendChild(emptyCommentBlock);

            init();

            window.commentsInserter('');

            expect(loadingBlock.style.display).toEqual('none');
            expect(emptyCommentBlock.style.display).not.toEqual('none');
        });
    });

    describe('window.articleCommentsFailed()', function () {
        it('if comments fail to load show failed comments block', function () {
            let commentsElem = document.createElement('div');
            let failedBlock = document.createElement('div');
            let loadingBlock = document.createElement('div');

            commentsElem.classList.add('comments');

            container.appendChild(commentsElem);

            loadingBlock.classList.add('comments__block--loading');

            container.appendChild(loadingBlock);

            failedBlock.classList.add('comments__block--failed');
            failedBlock.style.display = 'none';

            container.appendChild(failedBlock);

            init();

            window.articleCommentsFailed();

            expect(loadingBlock.style.display).toEqual('none');
            expect(failedBlock.style.display).not.toEqual('none');
            expect(commentsElem.classList.contains('comments-has-failed')).toEqual(true);
        });
    });

    describe('window.commentsFailed()', function () {
        it('if comments fail to load show failed comments block', function () {
            let commentsElem = document.createElement('div');
            let failedBlock = document.createElement('div');
            let loadingBlock = document.createElement('div');

            commentsElem.classList.add('comments');

            container.appendChild(commentsElem);

            loadingBlock.classList.add('comments__block--loading');

            container.appendChild(loadingBlock);

            failedBlock.classList.add('comments__block--failed');
            failedBlock.style.display = 'none';

            container.appendChild(failedBlock);

            init();

            window.commentsFailed();

            expect(loadingBlock.style.display).toEqual('none');
            expect(failedBlock.style.display).not.toEqual('none');
            expect(commentsElem.classList.contains('comments-has-failed')).toEqual(true);
        });
    });

    describe('window.commentsEnd()', function () {
        it('removes loadingBlock', function () {
            let loadingBlock = document.createElement('div');
            loadingBlock.classList += 'comments__block--loading';
            container.appendChild(loadingBlock);

            init();

            window.commentsEnd();

            expect(document.getElementsByClassName('comments__block--loading')[0]).toBeFalsy();
        });
    });

    describe('window.commentsClosed()', function () {
        it('marks comments as closed', function () {
            let discussionElem = document.createElement('div');
            let commentsElem = document.createElement('div');

            discussionElem.id = 'discussion';

            container.appendChild(discussionElem);

            commentsElem.classList.add('comments');

            container.appendChild(commentsElem);

            init();

            window.commentsClosed();

            expect(discussionElem.classList.contains('comments--closed')).toEqual(true);
            expect(commentsElem.classList.contains('comments--closed')).toEqual(true);
        });
    });

    describe('window.commentsOpen()', function () {
        it('marks comments as open', function () {
            let discussionElem = document.createElement('div');
            let commentsElem = document.createElement('div');

            discussionElem.id = 'discussion';

            container.appendChild(discussionElem);

            commentsElem.classList.add('comments');

            container.appendChild(commentsElem);

            init();

            window.commentsOpen();

            expect(discussionElem.classList.contains('comments--open')).toEqual(true);
            expect(commentsElem.classList.contains('comments--open')).toEqual(true);
        });
    });

    describe('window.commentTime()', function () {
        it('marks comments as open', function () {
            init();

            window.commentTime();
            
            const initMock = jest.spyOn(relativeDates, "init");
            expect(initMock).toHaveBeenCalled();
            expect(initMock).toHaveBeenCalledWith('.comment__timestamp', 'title');
        });
    });

    describe('window.commentsRecommendIncrease(id, number)', function () {
        it('marks comments as open', function () {
            let commentElem = document.createElement('div');
            let commentReccomends = document.createElement('div');
            let commentReccomendsCount = document.createElement('div');

            commentElem.id = 'xxx';

            init();

            commentReccomends.classList.add('comment__recommend');

            commentReccomendsCount.classList.add('comment__recommend__count');

            commentReccomends.appendChild(commentReccomendsCount);

            commentElem.appendChild(commentReccomends);

            container.appendChild(commentElem);

            window.commentsRecommendIncrease('xxx', '333');

            expect(commentReccomends.classList.contains('increase')).toEqual(true);
            expect(commentReccomendsCount.innerText).toEqual('333');
        });
    });

    describe('window.commentsRecommendDecrease(id, number)', function () {
        it('marks comments as open', function () {
            let commentElem = document.createElement('div');
            let commentReccomends = document.createElement('div');
            let commentReccomendsCount = document.createElement('div');

            commentElem.id = 'xxx';

            init();

            commentReccomends.classList.add('comment__recommend');
            commentReccomends.classList.add('increase');

            commentReccomendsCount.classList.add('comment__recommend__count');

            commentReccomends.appendChild(commentReccomendsCount);

            commentElem.appendChild(commentReccomends);

            container.appendChild(commentElem);

            window.commentsRecommendDecrease('xxx', '888');

            expect(commentReccomends.classList.contains('increase')).toEqual(false);
            expect(commentReccomendsCount.innerText).toEqual('888');
        });
    });
});
