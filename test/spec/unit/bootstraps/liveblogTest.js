define([
    'modules/util',
    'squire'
], function(
    util,
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/bootstraps/liveblog', function() {
        var dummyCommon,
            container,
            injector,
            sandbox;

        var relativeDatesMock,
            twitterMock,
            MyScrollMock,
            adsMock;
            
        beforeEach(function() {
            relativeDatesMock = {
                init: sinon.spy()
            };
            twitterMock = {
                init: sinon.spy(),
                checkForTweets: sinon.spy(),
                enhanceTweets: sinon.spy()
            };
            MyScrollMock = {};
            adsMock = {};
            dummyCommon = {
                formatImages: sinon.spy(),
                loadEmbeds: sinon.spy(),
                loadInteractives: sinon.spy()
            };
            container = document.createElement('div');
            container.id = 'container';
            document.body.appendChild(container);
            injector = new Squire();
            window.applyNativeFunctionCall = sinon.spy();
            window.GU = {};
            util.init();
            sandbox = sinon.sandbox.create();
            sandbox.stub(window, 'setInterval');
        });

        afterEach(function () {
            document.body.removeChild(container);

            delete window.liveblogDeleteBlock;
            delete window.liveblogUpdateBlock;
            delete window.liveblogLoadMore;
            delete window.liveblogTime;
            delete window.showLiveMore;
            delete window.liveblogNewBlock;

            delete window.GU;

            sandbox.restore();
        });

        describe('init()', function () {
            var scrollHandler;

            beforeEach(function () {
                sandbox.stub(GU.util, 'debounce', function(func) {
                    return func;
                });

                sandbox.stub(window, 'addEventListener');
            });

            afterEach(function () {
                expect(twitterMock.init).to.have.been.calledOnce;
            });

            it('sets up global functions', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .mock('modules/twitter', twitterMock)
                    .mock('modules/MyScroll', MyScrollMock)
                    .mock('modules/ads', adsMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/liveblog'], function (liveblog) {
                        liveblog.init(dummyCommon);

                        expect(window.liveblogDeleteBlock).to.not.be.undefined;
                        expect(window.liveblogUpdateBlock).to.not.be.undefined;
                        expect(window.liveblogLoadMore).to.not.be.undefined;
                        expect(window.liveblogTime).to.not.be.undefined;
                        expect(window.showLiveMore).to.not.be.undefined;
                        expect(window.liveblogNewBlock).to.not.be.undefined;

                        expect(window.applyNativeFunctionCall).to.have.been.calledWith('liveblogDeleteBlock');
                        expect(window.applyNativeFunctionCall).to.have.been.calledWith('liveblogUpdateBlock');
                        expect(window.applyNativeFunctionCall).to.have.been.calledWith('liveblogNewBlock');

                        done();
                    });
            });

            it('sets up scroll event listener', function (done) {
                injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .mock('modules/twitter', twitterMock)
                    .mock('modules/MyScroll', MyScrollMock)
                    .mock('modules/ads', adsMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/liveblog'], function (liveblog) {
                        liveblog.init(dummyCommon);

                        expect(window.addEventListener).to.have.been.calledOnce;
                        expect(window.addEventListener).to.have.been.calledWith('scroll');

                        done();
                    });
            });

            it('add click listener on load more element', function (done) {
                injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .mock('modules/twitter', twitterMock)
                    .mock('modules/MyScroll', MyScrollMock)
                    .mock('modules/ads', adsMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/liveblog'], function (liveblog) {
                        var event,
                            loadingElem = document.createElement('div'),
                            loadMoreElem = document.createElement('div');

                        GU.util.signalDevice = sinon.spy();

                        loadMoreElem.classList.add('more--live-blogs');
                        loadMoreElem.style.display = 'block';
                        container.appendChild(loadMoreElem);

                        loadingElem.classList.add('loading--liveblog');
                        container.appendChild(loadingElem);

                        liveblog.init(dummyCommon);

                        event = document.createEvent('HTMLEvents');
                        event.initEvent('click', true, true);
                        loadMoreElem.dispatchEvent(event);

                        setTimeout(function() {
                            expect(loadMoreElem.style.display).not.to.eql('block');
                            expect(loadingElem.classList.contains('loading--visible')).to.eql(true);
                            expect(GU.util.signalDevice).to.have.been.calledOnce;
                            expect(GU.util.signalDevice).to.have.been.calledWith('showmore');

                            done();
                        }, 1000);
                    });
            });

            it('does not setup liveblogTime interval if the minute', function (done) {
                injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .mock('modules/twitter', twitterMock)
                    .mock('modules/MyScroll', MyScrollMock)
                    .mock('modules/ads', adsMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/liveblog'], function (liveblog) {
                        document.body.classList.add('the-minute');

                        liveblog.init(dummyCommon);

                        expect(window.setInterval).not.to.have.been.called;

                        document.body.classList.remove('the-minute');

                        done();
                    });
            });

            it('setup liveblogTime interval and remove minute relate elements if not the minute', function (done) {
                injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .mock('modules/twitter', twitterMock)
                    .mock('modules/MyScroll', MyScrollMock)
                    .mock('modules/ads', adsMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/liveblog'], function (liveblog) {
                        var minuteHeader = document.createElement('div'),
                            minuteNav = document.createElement('div');

                        minuteHeader.classList.add('the-minute__header');
                        minuteNav.classList.add('the-minute__nav');

                        container.appendChild(minuteHeader);
                        container.appendChild(minuteNav);

                        liveblog.init(dummyCommon);

                        expect(window.setInterval).to.have.been.calledOnce;
                        expect(window.setInterval).to.have.been.calledWith(window.liveblogTime);
                        expect(minuteHeader.parentNode).to.be.falsy;
                        expect(minuteNav.parentNode).to.be.falsy;
                        expect(twitterMock.enhanceTweets).to.have.been.calledOnce;

                        done();
                    });
            });        
        });

        describe('window.liveblogDeleteBlock(blockID)', function () {
            it('deletes block with matching ID', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .mock('modules/twitter', twitterMock)
                    .mock('modules/MyScroll', MyScrollMock)
                    .mock('modules/ads', adsMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/liveblog'], function (liveblog) {
                        var block = document.createElement('div');

                        block.id = 'testBlock';

                        container.appendChild(block);
                        
                        liveblog.init(dummyCommon);

                        expect(block.parentNode).to.be.truthy;
                        expect(block.parentNode).to.eql(container);

                        window.liveblogDeleteBlock('testBlock');

                        expect(block.parentNode).to.be.falsy;

                        done();
                    });
            });
        });

        describe('window.liveblogUpdateBlock(blockID, html)', function () {
            it('replace block with new block html', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .mock('modules/twitter', twitterMock)
                    .mock('modules/MyScroll', MyScrollMock)
                    .mock('modules/ads', adsMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/liveblog'], function (liveblog) {
                        var block = document.createElement('div');

                        block.id = 'testBlock';

                        container.appendChild(block);
                        
                        liveblog.init(dummyCommon);

                        expect(container.firstChild.id).to.eql('testBlock');

                        window.liveblogUpdateBlock('testBlock', '<div id="newBlock"></div>');

                        expect(container.firstChild.id).to.eql('newBlock');

                        done();
                    });
            });
        });

        describe('window.liveblogLoadMore(html)', function () {
            var loadingLiveblog,
                articleBody;

            beforeEach(function () {
                articleBody = document.createElement('div');
                articleBody.classList.add('article__body');
                articleBody.innerHTML = '<div class="block"><img></img></div><div class="block"></div>';

                loadingLiveblog = document.createElement('div');
                loadingLiveblog.classList.add('loading--liveblog');
                loadingLiveblog.classList.add('loading--visible');

                container.appendChild(articleBody);
                container.appendChild(loadingLiveblog);
            });

            it('loads new HTML blocks into page', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .mock('modules/twitter', twitterMock)
                    .mock('modules/MyScroll', MyScrollMock)
                    .mock('modules/ads', adsMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/liveblog'], function (liveblog) {
                        var html = '',
                            blockCount = 0;

                        while (blockCount < 5) {
                            html += '<div class="block"></div>';
                            blockCount++;
                        }

                        liveblog.init(dummyCommon);

                        window.liveblogTime = sinon.spy();

                        window.liveblogLoadMore(html);

                        expect(container.getElementsByClassName('block').length).to.eql(7);
                        expect(dummyCommon.formatImages).to.have.been.calledOnce;
                        expect(dummyCommon.loadEmbeds).to.have.been.calledOnce;
                        expect(dummyCommon.loadInteractives).to.have.been.calledOnce;
                        expect(window.liveblogTime).to.have.been.calledOnce;
                        expect(window.liveblogTime).to.have.been.calledOnce;
                        expect(twitterMock.checkForTweets).to.have.been.calledOnce;

                        done();
                    });
            });

            it('pass images in new blocks to be formatted', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .mock('modules/twitter', twitterMock)
                    .mock('modules/MyScroll', MyScrollMock)
                    .mock('modules/ads', adsMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/liveblog'], function (liveblog) {
                        var imgCount = 0,
                            html = '',
                            blockCount = 0;

                        while (blockCount < 2) {
                            html += '<div class="block"><img></img></div>';
                            blockCount++;
                        }

                        dummyCommon.formatImages = function (imgList) {
                            imgCount = imgList.length;
                        };

                        liveblog.init(dummyCommon);

                        window.liveblogTime = sinon.spy();

                        window.liveblogLoadMore(html);

                        expect(imgCount).to.eql(2);

                        done();
                    });
            });
        });

        describe('window.liveblogTime()', function () {
            var liveblogElem,
                blockTime;

            beforeEach(function() {
                liveblogElem = document.createElement('div');
                liveblogElem.classList.add('tone--liveBlog');
                container.appendChild(liveblogElem);
            });

            it('Updates liveblog time if blog is live', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .mock('modules/twitter', twitterMock)
                    .mock('modules/MyScroll', MyScrollMock)
                    .mock('modules/ads', adsMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/liveblog'], function (liveblog) { 
                        liveblogElem.classList.add('is-live');

                        liveblog.init(dummyCommon);

                        window.liveblogTime();

                        expect(relativeDatesMock.init).to.have.been.called;
                        expect(relativeDatesMock.init).to.have.been.calledWith('.block__time', 'title');

                        done();
                    });
            });

            it('Updates liveblog time if blog is not live', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .mock('modules/twitter', twitterMock)
                    .mock('modules/MyScroll', MyScrollMock)
                    .mock('modules/ads', adsMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/liveblog'], function (liveblog) { 
                        var blockTime = document.createElement('div');

                        blockTime.classList.add('block__time');
                        blockTime.setAttribute('title', 'xxx');

                        container.appendChild(blockTime);

                        liveblog.init(dummyCommon);

                        window.liveblogTime();

                        expect(blockTime.innerHTML).to.eql('xxx');

                        done();
                    });
            });
        });

        describe('window.showLiveMore(show)', function () {
            var moreElem;

            beforeEach(function() {
                moreElem = document.createElement('div');
                moreElem.classList.add('more--live-blogs');
                container.appendChild(moreElem);
            });

            it('hide elem if show value is false', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .mock('modules/twitter', twitterMock)
                    .mock('modules/MyScroll', MyScrollMock)
                    .mock('modules/ads', adsMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/liveblog'], function (liveblog) { 
                        moreElem.style.display = 'block';

                        liveblog.init(dummyCommon);

                        window.showLiveMore(false);

                        expect(moreElem.style.display).not.to.eql('block');

                        done();
                    });
            });

            it('show elem if show value is true', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .mock('modules/twitter', twitterMock)
                    .mock('modules/MyScroll', MyScrollMock)
                    .mock('modules/ads', adsMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/liveblog'], function (liveblog) { 
                        moreElem.style.display = 'none';

                        liveblog.init(dummyCommon);

                        window.showLiveMore(true);

                        expect(moreElem.style.display).not.to.eql('none');

                        done();
                    });
            });
        });

        describe('window.liveblogNewBlock(html)', function () {
            var liveblogBody,
                articleBody;

            beforeEach(function () {
                window.updateLiveblogAdPlaceholders = sinon.spy();

                articleBody = document.createElement('div');
                articleBody.classList.add('article__body');
                articleBody.innerHTML = '<div class="article__body--liveblog__pinned"></div>';
            
                liveblogBody = document.createElement('div');
                liveblogBody.classList.add('article__body--liveblog');

                container.appendChild(articleBody);
                container.appendChild(liveblogBody);
            });

            afterEach(function () {
                expect(dummyCommon.loadEmbeds).to.have.been.calledOnce;
                expect(dummyCommon.loadInteractives).to.have.been.calledOnce;
                expect(window.updateLiveblogAdPlaceholders).to.have.been.calledOnce;
                expect(window.updateLiveblogAdPlaceholders).to.have.been.calledWith(true);
                expect(window.liveblogTime).to.have.been.calledOnce;

                delete window.updateLiveblogAdPlaceholders;
            });

            it('add new blocks to article body', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .mock('modules/twitter', twitterMock)
                    .mock('modules/MyScroll', MyScrollMock)
                    .mock('modules/ads', adsMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/liveblog'], function (liveblog) { 
                        var blocks,
                            html = '<div class="block"><img></img></div><div class="block"></div>';

                        liveblog.init(dummyCommon);

                        window.liveblogTime = sinon.spy();

                        window.liveblogNewBlock(html);

                        blocks = document.getElementsByClassName('block');

                        expect(blocks.length).to.eql(2);
                        expect((blocks[0].classList.contains('animated') && 
                            blocks[0].classList.contains('slideinright'))).to.eql(true);
                        expect((blocks[1].classList.contains('animated') && 
                            blocks[0].classList.contains('slideinright'))).to.eql(true);
                        expect(dummyCommon.formatImages).to.have.been.calledOnce;

                        done();
                    });
            });

            it('pass images in new blocks to be formatted', function (done) {
               injector
                    .mock('modules/relativeDates', relativeDatesMock)
                    .mock('modules/twitter', twitterMock)
                    .mock('modules/MyScroll', MyScrollMock)
                    .mock('modules/ads', adsMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/liveblog'], function (liveblog) { 
                        var imgCount = 0,
                            html = '<div class="block"><img></img></div><div class="block"></div>';

                        liveblog.init(dummyCommon);

                        window.liveblogTime = sinon.spy();

                        dummyCommon.formatImages = function (imgList) {
                            imgCount = imgList.length;
                        };

                        window.liveblogNewBlock(html);

                        expect(imgCount).to.eql(1);

                        done();
                    });
            });
        });
    });
});