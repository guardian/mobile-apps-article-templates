define([
    'squire'
], function (
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/bootstraps/liveblog', function () {
        var liveblog,
            container,
            sandbox,
            liveblogBody;

        var commonMock,
            relativeDatesMock,
            twitterMock,
            minuteMock,
            creativeInjectorMock,
            utilMock;

        beforeEach(function (done) {
            var injector = new Squire();

            container = document.createElement('div');
            container.id = 'container';
            document.body.appendChild(container);

            liveblogBody = document.createElement('div');
            liveblogBody.classList.add('article__body--liveblog');
            container.appendChild(liveblogBody);

            sandbox = sinon.sandbox.create();

            sandbox.stub(window, 'setInterval');
            window.applyNativeFunctionCall = sandbox.spy();
            
            window.GU = {
                opts: {
                    isMinute: '',
                    adsConfig: 'mobile'
                }
            };

            relativeDatesMock = {
                init: sandbox.spy()
            };
            twitterMock = {
                init: sandbox.spy(),
                checkForTweets: sandbox.spy()
            };
            commonMock = {
                formatImages: sandbox.spy(),
                loadEmbeds: sandbox.spy(),
                loadInteractives: sandbox.spy()
            };
            minuteMock = {
                init: sandbox.spy()
            };
            creativeInjectorMock = {
                init: sandbox.spy(),
                trackLiveBlogEpic: sandbox.spy()
            };
            utilMock = {
                debounce: sandbox.spy(),
                getElementOffset: sandbox.spy()
            };

            injector
                .mock('modules/relativeDates', relativeDatesMock)
                .mock('modules/twitter', twitterMock)
                .mock('bootstraps/common', commonMock)
                .mock('modules/minute', minuteMock)
                .mock('modules/creativeInjector', creativeInjectorMock)
                .mock('modules/util', utilMock)
                .require(['ArticleTemplates/assets/js/bootstraps/liveblog'], function (sut) {
                    liveblog = sut;

                    done();
                });
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
            beforeEach(function () {
                sandbox.stub(window, 'addEventListener');
            });

            it('does not initialise minute module if not the minute', function () {
                liveblog.init();

                expect(minuteMock.init).not.to.have.been.called;
            });

            it('initialise minute module if the minute', function () {
                window.GU.opts.isMinute = true;
                window.GU.opts.adsConfig = 'tablet';

                liveblog.init();

                expect(minuteMock.init).to.have.been.calledOnce;
            });

            it('initialises twitter module if not the minute', function () {
                liveblog.init();

                expect(twitterMock.init).to.have.been.calledOnce;
            });

            it('does not initialise twitter module if the minute', function () {
                window.GU.opts.isMinute = true;
                window.GU.opts.adsConfig = 'tablet';

                liveblog.init();

                expect(twitterMock.init).not.to.have.been.called;
            });

            it('sets up global functions', function () {
                liveblog.init();

                expect(window.liveblogDeleteBlock).to.not.be.undefined;
                expect(window.liveblogUpdateBlock).to.not.be.undefined;
                expect(window.liveblogLoadMore).to.not.be.undefined;
                expect(window.liveblogTime).to.not.be.undefined;
                expect(window.showLiveMore).to.not.be.undefined;
                expect(window.liveblogNewBlock).to.not.be.undefined;

                expect(window.applyNativeFunctionCall).to.have.been.calledWith('liveblogDeleteBlock');
                expect(window.applyNativeFunctionCall).to.have.been.calledWith('liveblogUpdateBlock');
                expect(window.applyNativeFunctionCall).to.have.been.calledWith('liveblogNewBlock');
            });

            it('sets up scroll event listener', function () {
                liveblog.init();

                expect(window.addEventListener).to.have.been.calledWith('scroll');
            });

            it('add click listener on load more element', function (done) {
                var event,
                    loadingElem = document.createElement('div'),
                    loadMoreElem = document.createElement('div');

                loadMoreElem.classList.add('more--live-blogs');
                loadMoreElem.style.display = 'block';
                container.appendChild(loadMoreElem);

                loadingElem.classList.add('loading--liveblog');
                container.appendChild(loadingElem);

                utilMock.signalDevice = sandbox.spy();

                liveblog.init();

                event = document.createEvent('HTMLEvents');
                event.initEvent('click', true, true);
                loadMoreElem.dispatchEvent(event);

                setTimeout(function () {
                    expect(loadMoreElem.style.display).not.to.eql('block');
                    expect(loadingElem.classList.contains('loading--visible')).to.eql(true);
                    expect(utilMock.signalDevice).to.have.been.calledOnce;
                    expect(utilMock.signalDevice).to.have.been.calledWith('showmore');

                    done();
                }, 1000);
            });

            it('does not setup liveblogTime interval if the minute', function () {
                window.GU.opts.isMinute = true;
                window.GU.opts.adsConfig = 'tablet';

                liveblog.init();

                expect(window.setInterval).not.to.have.been.called;
            });

            it('setup liveblogTime interval and remove minute relate elements if not the minute', function () {
                var minuteHeader = document.createElement('div'),
                    minuteNav = document.createElement('div');

                minuteHeader.classList.add('the-minute__header');
                minuteNav.classList.add('the-minute__nav');

                container.appendChild(minuteHeader);
                container.appendChild(minuteNav);

                liveblog.init();

                expect(window.setInterval).to.have.been.calledOnce;
                expect(window.setInterval).to.have.been.calledWith(window.liveblogTime);
                expect(minuteHeader.parentNode).to.be.falsy;
                expect(minuteNav.parentNode).to.be.falsy;
            });        
        });

        describe('window.liveblogDeleteBlock(blockID)', function () {
            it('deletes block with matching ID', function () {
                var block = document.createElement('div');

                block.id = 'testBlock';

                container.appendChild(block);

                liveblog.init();

                expect(block.parentNode).to.be.truthy;
                expect(block.parentNode).to.eql(container);

                window.liveblogDeleteBlock('testBlock');

                expect(block.parentNode).to.be.falsy;
            });
        });

        describe('window.liveblogUpdateBlock(blockID, html)', function () {
            it('replace block with new block html', function () {
                var block = document.createElement('div'),
                    newBlock = document.createElement('div');

                block.id = 'testBlock';
                newBlock.id = 'newBlock';

                container.appendChild(block);

                liveblog.init();

                expect(container.lastChild.id).to.eql('testBlock');

                utilMock.getElemsFromHTML = sandbox.stub().returns([newBlock]);

                window.liveblogUpdateBlock('testBlock', newBlock.outerHTML);

                expect(container.lastChild.id).to.eql('newBlock');
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

            it('loads new HTML blocks into page', function () {
                var block,
                    blockList = [],
                    html = '';

                while (blockList.length < 5) {
                    block = document.createElement('div');
                    block.classList.add('block');
                    blockList.push(block);
                    html += block.outerHTML;
                }

                liveblog.init();

                window.liveblogTime = sandbox.spy();

                utilMock.getElemsFromHTML = sandbox.stub().returns(blockList);

                window.liveblogLoadMore(html);

                expect(container.getElementsByClassName('block').length).to.eql(7);
                expect(commonMock.formatImages).to.have.been.calledOnce;
                expect(commonMock.loadEmbeds).to.have.been.calledOnce;
                expect(commonMock.loadInteractives).to.have.been.calledOnce;
                expect(window.liveblogTime).to.have.been.calledOnce;
                expect(window.liveblogTime).to.have.been.calledOnce;
                expect(twitterMock.checkForTweets).to.have.been.calledOnce;
            });

            it('pass images in new blocks to be formatted', function () {
                var block,
                    imgCount = 0,
                    blockList = [],
                    html = '';

                while (blockList.length < 5) {
                    block = document.createElement('div');
                    block.classList.add('block');
                    block.innerHTML = '<img></img>';
                    blockList.push(block);
                    html += block.outerHTML;
                }

                commonMock.formatImages = function (imgList) {
                    imgCount = imgList.length;
                };

                liveblog.init();

                window.liveblogTime = sandbox.spy();

                utilMock.getElemsFromHTML = sandbox.stub().returns(blockList);

                window.liveblogLoadMore(html);

                expect(imgCount).to.eql(5);
            });
        });

        describe('window.liveblogTime()', function () {
            var liveblogElem;

            beforeEach(function () {
                liveblogElem = document.createElement('div');
                liveblogElem.classList.add('tone--liveBlog');
                container.appendChild(liveblogElem);
            });

            it('Updates liveblog time if blog is live', function () {
                window.GU.opts.isLive = true;

                liveblog.init();

                window.liveblogTime();

                expect(relativeDatesMock.init).to.have.been.called;
                expect(relativeDatesMock.init).to.have.been.calledWith('.key-event__time, .block__time', 'title');
            });

            it('Updates liveblog time if blog is not live', function () {
                var blockTime = document.createElement('div');

                window.GU.opts.isLive = false;

                blockTime.classList.add('block__time');
                blockTime.setAttribute('title', 'xxx');

                container.appendChild(blockTime);

                liveblog.init();

                window.liveblogTime();

                expect(blockTime.innerHTML).to.eql('xxx');
            });
        });

        describe('window.showLiveMore(show)', function () {
            var moreElem;

            beforeEach(function () {
                moreElem = document.createElement('div');
                moreElem.classList.add('more--live-blogs');
                container.appendChild(moreElem);
            });

            it('hide elem if show value is false', function () {
                moreElem.style.display = 'block';

                liveblog.init();

                window.showLiveMore(false);

                expect(moreElem.style.display).not.to.eql('block');
            });

            it('show elem if show value is true', function () {
                moreElem.style.display = 'none';

                liveblog.init();

                window.showLiveMore(true);

                expect(moreElem.style.display).not.to.eql('none');
            });
        });

        describe('window.liveblogNewBlock(html)', function () {
            var articleBody,
                blockWithImage,
                blockWithoutImage,
                html;

            beforeEach(function () {
                blockWithImage = document.createElement('div'),
                blockWithoutImage = document.createElement('div'),
                html;

                blockWithImage.classList.add('block');
                blockWithoutImage.classList.add('block');

                blockWithImage.innerHTML = '<img/>'; 

                html = blockWithImage.outerHTML + blockWithoutImage.outerHTML;

                utilMock.getElemsFromHTML = sandbox.stub().returns([blockWithImage, blockWithoutImage]);

                utilMock.getElementOffset = sandbox.stub().returns({
                    width: 100,
                    height: 100,
                    left: 100,
                    top: 100
                });

                window.updateLiveblogAdPlaceholders = sandbox.spy();

                articleBody = document.createElement('div');
                articleBody.classList.add('article__body');
                articleBody.innerHTML = '<div class="article__body--liveblog__pinned"></div>';
            
                container.appendChild(articleBody);
            });

            afterEach(function () {
                expect(commonMock.loadEmbeds).to.have.been.calledOnce;
                expect(commonMock.loadInteractives).to.have.been.calledOnce;
                expect(window.updateLiveblogAdPlaceholders).to.have.been.calledOnce;
                expect(window.updateLiveblogAdPlaceholders).to.have.been.calledWith(true);
                expect(window.liveblogTime).to.have.been.calledOnce;

                delete window.updateLiveblogAdPlaceholders;
            });

            it('add new blocks to article body', function () {
                var blocks;

                liveblog.init();

                window.liveblogTime = sandbox.spy();

                window.liveblogNewBlock(html);

                blocks = document.getElementsByClassName('block');

                expect(blocks.length).to.eql(2);
                expect((blocks[0].classList.contains('animated') && 
                blocks[0].classList.contains('slideinright'))).to.eql(true);
                expect((blocks[1].classList.contains('animated') && 
                blocks[0].classList.contains('slideinright'))).to.eql(true);
                expect(commonMock.formatImages).to.have.been.calledOnce;
            });

            it('pass images in new blocks to be formatted', function () {
                var imgCount = 0;

                liveblog.init();

                window.liveblogTime = sandbox.spy();

                commonMock.formatImages = function (imgList) {
                    imgCount = imgList.length;
                };

                window.liveblogNewBlock(html);

                expect(imgCount).to.eql(1);
            });
        });
    });
});
