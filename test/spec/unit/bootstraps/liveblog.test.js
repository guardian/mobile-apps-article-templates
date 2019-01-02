import { init } from 'bootstraps/liveblog';
import * as minute from 'modules/minute';
import * as twitter from 'modules/twitter';
import * as util from 'modules/util';
import * as common from 'bootstraps/common';
import * as creative from 'modules/creativeInjector';
import * as relativeDates from 'modules/relativeDates';

jest.mock('fence', () => {});

describe('ArticleTemplates/assets/js/bootstraps/liveblog', function () {
    let container;
    let liveblogBody;
    let minuteInitMock;
    let twitterInitMock

    beforeEach(() => {
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

    afterEach(() => {
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
            let event;
            let loadingElem = document.createElement('div');
            let loadMoreElem = document.createElement('div');

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
            let minuteHeader = document.createElement('div');
            let minuteNav = document.createElement('div');

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
            let block = document.createElement('div');

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
            let block = document.createElement('div');
            let newBlock = document.createElement('div');

            block.id = 'testBlock';
            newBlock.id = 'newBlock';

            container.appendChild(block);

            init();

            expect(container.lastChild.id).toEqual('testBlock');

            window.liveblogUpdateBlock('testBlock', newBlock.outerHTML);

            expect(container.lastChild.id).toEqual('newBlock');
        });
    });

    describe('window.liveblogLoadMore(html)', function () {
        let loadingLiveblog;
        let articleBody;

        beforeEach(() => {
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
            let block;
            let blockList = [];
            let html = '';

            while (blockList.length < 5) {
                block = document.createElement('div');
                block.classList.add('block');
                blockList.push(block);
                html += block.outerHTML;
            }

            init();

            window.liveblogTime = jest.fn();
            const formatImagesMock = jest.spyOn(common, "formatImages");
            const loadEmbedsMock = jest.spyOn(common, "loadEmbeds");
            const loadInteractivesMock = jest.spyOn(common, "loadInteractives");
            const checkForTweetsMock = jest.spyOn(twitter, "checkForTweets");
            const trackLiveBlogEpicMock = jest.spyOn(creative, "trackLiveBlogEpic");

            window.liveblogLoadMore(html);

            expect(container.getElementsByClassName('block').length).toEqual(7);
            expect(formatImagesMock).toBeCalledTimes(1);
            expect(loadEmbedsMock).toBeCalledTimes(1);
            expect(loadInteractivesMock).toBeCalledTimes(1);
            expect(window.liveblogTime).toBeCalledTimes(1);
            expect(checkForTweetsMock).toBeCalledTimes(1);
            expect(trackLiveBlogEpicMock).toBeCalledTimes(1);
        });

        it('pass images in new blocks to be formatted', function () {
            let block;
            let imgCount = 0;
            let blockList = [];
            let html = '';

            while (blockList.length < 5) {
                block = document.createElement('div');
                block.classList.add('block');
                block.innerHTML = '<img></img>';
                blockList.push(block);
                html += block.outerHTML;
            }

            const formatImagesMock = jest.spyOn(common, "formatImages");

            formatImagesMock.mockImplementation((imgList) => {
                imgCount = imgList.length;
            });

            init();

            window.liveblogTime = jest.fn();
            window.liveblogLoadMore(html);

            expect(imgCount).toEqual(5);
        });
    });

    describe('window.liveblogTime()', function () {
        let liveblogElem;
        let relativeDatesMock;

        beforeEach(function () {
            liveblogElem = document.createElement('div');
            liveblogElem.classList.add('tone--liveBlog');
            container.appendChild(liveblogElem);
            relativeDatesMock = jest.spyOn(relativeDates, "init");
        });

        it('Updates liveblog time if blog is live', function () {
            window.GU.opts.isLive = true;

            init();

            window.liveblogTime();

            expect(relativeDatesMock).toBeCalled();
            expect(relativeDatesMock).toBeCalledWith('.key-event__time, .block__time', 'title');
        });

        it('Updates liveblog time if blog is not live', function () {
            var blockTime = document.createElement('div');

            window.GU.opts.isLive = false;

            blockTime.classList.add('block__time');
            blockTime.setAttribute('title', 'xxx');

            container.appendChild(blockTime);

            init();

            window.liveblogTime();

            expect(blockTime.innerHTML).toEqual('xxx');
        });
    });

    describe('window.showLiveMore(show)', function () {
        let moreElem;

        beforeEach(() => {
            moreElem = document.createElement('div');
            moreElem.classList.add('more--live-blogs');
            container.appendChild(moreElem);
        });

        it('hide elem if show value is false', function () {
            moreElem.style.display = 'block';

            init();

            window.showLiveMore(false);

            expect(moreElem.style.display).not.toEqual('block');
        });

        it('show elem if show value is true', function () {
            moreElem.style.display = 'none';

            init();

            window.showLiveMore(true);

            expect(moreElem.style.display).not.toEqual('none');
        });
    });

    describe('window.liveblogNewBlock(html)', function () {
        let articleBody;
        let blockWithImage;
        let blockWithoutImage;
        let html;

        beforeEach(() => {
            blockWithImage = document.createElement('div'),
            blockWithoutImage = document.createElement('div'),
            html;

            blockWithImage.classList.add('block');
            blockWithoutImage.classList.add('block');

            blockWithImage.innerHTML = '<img/>'; 

            html = blockWithImage.outerHTML + blockWithoutImage.outerHTML;

            const getElemsFromHTMLMock = jest.spyOn(util, "getElemsFromHTML");
            getElemsFromHTMLMock.mockImplementation(() => [blockWithImage, blockWithoutImage]);

            const getElementOffsetMock = jest.spyOn(util, "getElementOffset");
            getElementOffsetMock.mockImplementation(() => {
                return {
                    "width": 100,
                    "height": 100,
                    "left": 100,
                    "top": 100
                };
            });

            window.updateLiveblogAdPlaceholders = jest.fn();

            articleBody = document.createElement('div');
            articleBody.classList.add('article__body');
            articleBody.innerHTML = '<div class="article__body--liveblog__pinned"></div>';
        
            container.appendChild(articleBody);
        });

        afterEach(() => {
            expect(window.updateLiveblogAdPlaceholders).toHaveBeenCalledTimes(1);
            expect(window.updateLiveblogAdPlaceholders).toBeCalledWith(true);
        });

        it('add new blocks to article body', function () {
            let blocks;

            init();

            window.liveblogTime = jest.fn();

            window.liveblogNewBlock(html);

            blocks = document.getElementsByClassName('block');

            expect(blocks.length).toEqual(2);
            expect(blocks[0].classList.contains('animated') && blocks[0].classList.contains('slideinright')).toEqual(true);
            expect(blocks[1].classList.contains('animated') && blocks[0].classList.contains('slideinright')).toEqual(true);
        });

        it('pass images in new blocks to be formatted', function () {
            let imgCount = 0;

            init();

            window.liveblogTime = jest.fn();

            const formatImagesMock = jest.spyOn(common, "formatImages");

            formatImagesMock.mockImplementation((imgList) => {
                imgCount = imgList.length;
            });

            window.liveblogNewBlock(html);

            expect(imgCount).toEqual(1);
        });
    });
});
