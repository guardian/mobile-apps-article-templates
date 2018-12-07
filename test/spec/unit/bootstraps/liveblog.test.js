import { init } from 'bootstraps/liveblog';
import * as minute from "modules/minute";
import * as twitter from "modules/twitter";
import * as util from "modules/util";

jest.mock('fence', () => {});
// jest.mock('modules/minute', () => {
//     return {
//         init: jest.fn()
//     };
// });


describe('ArticleTemplates/assets/js/bootstraps/liveblog', function () {
    var clock,
        liveblog,
        sandbox;

    var commonMock,
        relativeDatesMock,
        twitterMock,
        minuteMock,
        creativeInjectorMock,
        utilMock,
        cardsMock;

    let container;
    let liveblogBody;
    let minuteInitMock;
    let twitterInitMock

    beforeEach(function () {
        container = document.createElement('div');
        container.id = 'container';
        document.body.appendChild(container);

        liveblogBody = document.createElement('div');
        liveblogBody.classList.add('article__body--liveblog');
        container.appendChild(liveblogBody);

        jest.spyOn(window, "setInterval");
        window.setInterval = jest.fn();
        window.applyNativeFunctionCall = jest.fn();
        
        window.GU = {
            opts: {
                isMinute: '',
                adsConfig: 'mobile'
            }
        };

        minuteInitMock = jest.spyOn(minute, "init");
        twitterInitMock = jest.spyOn(twitter, "init");
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
    });

    describe('init()', function () {
        beforeEach(function () {
            window.addEventListener = jest.fn();
        });

        it('does not initialise minute module if not the minute', function () {
            init();

            expect(minuteInitMock).not.toBeCalled();
        });

        it('initialise minute module if the minute', function () {
            window.GU.opts.isMinute = true;
            window.GU.opts.adsConfig = 'tablet';

            init();

            expect(minuteInitMock).toHaveBeenCalledTimes(1);
        });

        it('sets up global functions', function () {
            init();

            expect(window.liveblogDeleteBlock).toBeDefined();
            expect(window.liveblogUpdateBlock).toBeDefined();
            expect(window.liveblogLoadMore).toBeDefined();
            expect(window.liveblogTime).toBeDefined();
            expect(window.showLiveMore).toBeDefined();
            expect(window.liveblogNewBlock).toBeDefined();

            expect(window.applyNativeFunctionCall).toBeCalledWith('liveblogDeleteBlock');
            expect(window.applyNativeFunctionCall).toBeCalledWith('liveblogUpdateBlock');
            expect(window.applyNativeFunctionCall).toBeCalledWith('liveblogNewBlock');
        });

        it('sets up scroll event listener', function () {
            init();

            expect(window.addEventListener).toBeCalledWith('scroll', expect.any(Function));
        });

        it('add click listener on load more element', function () {
            var event,
                loadingElem = document.createElement('div'),
                loadMoreElem = document.createElement('div');

            loadMoreElem.classList.add('more--live-blogs');
            loadMoreElem.style.display = 'block';
            container.appendChild(loadMoreElem);

            loadingElem.classList.add('loading--liveblog');
            container.appendChild(loadingElem);
            
            const signalDeviceMock = jest.spyOn(util, "signalDevice");

            init();

            event = document.createEvent('HTMLEvents');
            event.initEvent('click', true, true);
            loadMoreElem.dispatchEvent(event);

            // clock.tick(1500);

            expect(loadMoreElem.style.display).not.toEqual('block');
            expect(loadingElem.classList.contains('loading--visible')).toEqual(true);
            expect(signalDeviceMock).toHaveBeenCalledTimes(1);
            expect(signalDeviceMock).toBeCalledWith('showmore');
        });

        it('does not setup liveblogTime interval if the minute', function () {
            window.GU.opts.isMinute = true;
            window.GU.opts.adsConfig = 'tablet';

            init();

            expect(window.setInterval).not.toBeCalled();
        });

        it('setup liveblogTime interval and remove minute relate elements if not the minute', function () {
            var minuteHeader = document.createElement('div'),
                minuteNav = document.createElement('div');

            minuteHeader.classList.add('the-minute__header');
            minuteNav.classList.add('the-minute__nav');

            container.appendChild(minuteHeader);
            container.appendChild(minuteNav);

            init();

            expect(window.setInterval).toBeCalled();
            expect(window.setInterval).toBeCalledWith(window.liveblogTime, 30000);
            expect(minuteHeader.parentNode).toBeFalsy();
        });        
    });

    describe('window.liveblogDeleteBlock(blockID)', function () {
        it('deletes block with matching ID', function () {
            var block = document.createElement('div');

            block.id = 'testBlock';

            container.appendChild(block);

            init();

            expect(block.parentNode).toBeTruthy();
            expect(block.parentNode).toEqual(container);

            window.liveblogDeleteBlock('testBlock');

            expect(block.parentNode).toBeFalsy();
        });
    });

    describe('window.liveblogUpdateBlock(blockID, html)', function () {
        it('replace block with new block html', function () {
            var block = document.createElement('div'),
                newBlock = document.createElement('div');

            block.id = 'testBlock';
            newBlock.id = 'newBlock';

            container.appendChild(block);

            init();

            expect(container.lastChild.id).toEqual('testBlock');

            // utilMock.getElemsFromHTML = sandbox.stub().returns([newBlock]);
            // jest.mock('modules/minute', () => {
            //     return {
            //         init: jest.fn()
            //     };
            // });

            window.liveblogUpdateBlock('testBlock', newBlock.outerHTML);

            // expect(container.lastChild.id).to.eql('newBlock');
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

            init();

            // window.liveblogTime = sandbox.spy();

            // utilMock.getElemsFromHTML = sandbox.stub().returns(blockList);

            window.liveblogLoadMore(html);

            // expect(container.getElementsByClassName('block').length).to.eql(7);
            // expect(commonMock.formatImages).to.have.been.calledOnce;
            // expect(commonMock.loadEmbeds).to.have.been.calledOnce;
            // expect(commonMock.loadInteractives).to.have.been.calledOnce;
            // expect(window.liveblogTime).to.have.been.calledOnce;
            // expect(window.liveblogTime).to.have.been.calledOnce;
            // expect(twitterMock.checkForTweets).to.have.been.calledOnce;
            // Called once when the liveblog loads, another time when a block comes in
            // expect(creativeInjectorMock.trackLiveBlogEpic).to.have.been.calledTwice;
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

            // commonMock.formatImages = function (imgList) {
            //     imgCount = imgList.length;
            // };

            init();

            // window.liveblogTime = sandbox.spy();

            // utilMock.getElemsFromHTML = sandbox.stub().returns(blockList);

            window.liveblogLoadMore(html);

            // expect(imgCount).to.eql(5);
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

            init();

            window.liveblogTime();

            // expect(relativeDatesMock.init).to.have.been.called;
            // expect(relativeDatesMock.init).to.have.been.calledWith('.key-event__time, .block__time', 'title');
        });

        it('Updates liveblog time if blog is not live', function () {
            var blockTime = document.createElement('div');

            window.GU.opts.isLive = false;

            blockTime.classList.add('block__time');
            blockTime.setAttribute('title', 'xxx');

            container.appendChild(blockTime);

            init();

            window.liveblogTime();

            // expect(blockTime.innerHTML).to.eql('xxx');
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

            init();

            window.showLiveMore(false);

            // expect(moreElem.style.display).not.to.eql('block');
        });

        it('show elem if show value is true', function () {
            moreElem.style.display = 'none';

            init();

            window.showLiveMore(true);

            // expect(moreElem.style.display).not.to.eql('none');
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

            // utilMock.getElemsFromHTML = sandbox.stub().returns([blockWithImage, blockWithoutImage]);

            // utilMock.getElementOffset = sandbox.stub().returns({
            //     width: 100,
            //     height: 100,
            //     left: 100,
            //     top: 100
            // });

            window.updateLiveblogAdPlaceholders = jest.fn();

            articleBody = document.createElement('div');
            articleBody.classList.add('article__body');
            articleBody.innerHTML = '<div class="article__body--liveblog__pinned"></div>';
        
            container.appendChild(articleBody);
        });

        afterEach(function () {
            // expect(commonMock.loadEmbeds).to.have.been.calledOnce;
            // expect(commonMock.loadInteractives).to.have.been.calledOnce;
            // expect(window.updateLiveblogAdPlaceholders).to.have.been.calledOnce;
            // expect(window.updateLiveblogAdPlaceholders).to.have.been.calledWith(true);
            // expect(window.liveblogTime).to.have.been.calledOnce;

            delete window.updateLiveblogAdPlaceholders;
        });

        it('add new blocks to article body', function () {
            var blocks;

            init();

            // window.liveblogTime = sandbox.spy();

            window.liveblogNewBlock(html);

            blocks = document.getElementsByClassName('block');

            // expect(blocks.length).to.eql(2);
            // expect((blocks[0].classList.contains('animated') && 
            // blocks[0].classList.contains('slideinright').to.eql(true);
            // expect((blocks[1].classList.contains('animated') && 
            // blocks[0].classList.contains('slideinright').to.eql(true);
            // expect(commonMock.formatImages).to.have.been.calledOnce;
        });

        it('pass images in new blocks to be formatted', function () {
            var imgCount = 0;

            init();

            // window.liveblogTime = sandbox.spy();

            // commonMock.formatImages = function (imgList) {
            //     imgCount = imgList.length;
            // };

            window.liveblogNewBlock(html);

            // expect(imgCount).to.eql(1);
        });
    });
});
