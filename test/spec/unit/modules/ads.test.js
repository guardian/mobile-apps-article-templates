
import { init, updateMPUPosition } from 'modules/ads';
import * as util from 'modules/util';

describe('ArticleTemplates/assets/js/modules/ads', function () {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'container';
        document.body.appendChild(container);

        document.body.classList.add('no-ready');

        window.applyNativeFunctionCall = jest.fn();

        window.GuardianJSInterface = {
            mpuLiveblogAdsPosition: jest.fn(),
            mpuAdsPosition: jest.fn()
        };

        window.GU = {
            opts: {
                useAdsReady: 'true',
                platform: 'ios'
            }
        };

        const signalDeviceMock = jest.spyOn(util, "signalDevice");
    });

    afterEach(() => {
        document.body.removeChild(container);

        document.body.classList.remove('no-ready');

        if (window.killMpuPoller) {
            window.killMpuPoller();
        }

        delete window.initMpuPoller;
        delete window.killMpuPoller;
        delete window.updateLiveblogAdPlaceholders;
        delete window.getMpuPosCommaSeparated;
        delete window.applyNativeFunctionCall;
        delete window.GU;
        delete window.GuardianJSInterface;
    });

    describe('init(config)', function () {
        var config;

        beforeEach(function () {
            config = {};
        });

        describe('if adsType is liveblog', function () {
            var articleBody;

            beforeEach(function () {
                let i;
                let html = '';

                articleBody = document.createElement('div');

                articleBody.classList.add('article__body');

                for (i = 0; i < 8; i++) {
                    html += '<div class="block"></div>';
                }

                articleBody.innerHTML = html;

                container.appendChild(articleBody);
            });

            it('inserts liveblog ad placeholders', function () {
                config.adsType = 'liveblog';

                init(config);

                expect(articleBody.children.length).toEqual(10);
                expect(articleBody.children[2].classList.contains('advert-slot')).toEqual(true);
                expect(articleBody.children[9].classList.contains('advert-slot')).toEqual(true);

                expect(window.initMpuPoller).toBeDefined();
                expect(window.killMpuPoller).toBeDefined();
                expect(window.getMpuPosCommaSeparated).toBeDefined();

                expect(window.applyNativeFunctionCall).toHaveBeenCalledTimes(1);
                expect(window.applyNativeFunctionCall).toHaveBeenCalledWith('initMpuPoller');
                expect(window.updateLiveblogAdPlaceholders).toBeDefined();
            });
        });

        describe('if adsType is not liveblog', function () {
            let prose;
            let articleBody;

            beforeEach(function () {
                articleBody = document.createElement('div');
                prose = document.createElement('div');

                articleBody.classList.add('article__body');
                prose.classList.add('prose');

                prose.innerHTML = '<p>Hi</p><p>How</p><p>Are</p><p>You?</p>';
                articleBody.appendChild(prose);

                container.appendChild(articleBody);
            });

            it('inserts ad placeholder', function () {
                config.mpuAfterParagraphs = 3;
                config.adsType = 'default';

                init(config);

                expect(window.initMpuPoller).toBeDefined();
                expect(window.killMpuPoller).toBeDefined();
                expect(window.getMpuPosCommaSeparated).toBeDefined();

                expect(window.applyNativeFunctionCall).toHaveBeenCalledTimes(1);
                expect(window.applyNativeFunctionCall).toHaveBeenCalledWith('initMpuPoller');
                expect(prose.children[0].classList.contains('advert-slot--placeholder')).toEqual(true);
                expect(prose.children[4].classList.contains('advert-slot--mpu')).toEqual(true);
            });

            it('does not insert ad placeholder if too few paragraphs', function () {
                prose.innerHTML = '<p>Hello</p><p>World</p>';

                init(config);

                expect(prose.querySelector('.advert-slot--placeholder')).toBeFalsy();
                expect(prose.querySelector('.advert-slot--mpu')).toBeFalsy();
            });

            it('fires ads ready if has not been fired already', function () {
                config.mpuAfterParagraphs = 3;
                config.adsType = 'default';

                document.body.classList.remove('no-ready');

                init(config);
                
                const signalDeviceMock = jest.spyOn(util, "signalDevice");
                expect(signalDeviceMock).toHaveBeenCalledWith('ads-ready');
            });
        });

        describe('if ios calls initMpuPoller()', function () {
            let prose;
            let articleBody;
            const resizedSlotWrapper = function () {
                var advertSlotWrapper = document.querySelector('.advert-slot__wrapper');

                advertSlotWrapper.style.height = '100px';
                advertSlotWrapper.style.width = '100px';
                advertSlotWrapper.style.position = 'absolute';
                advertSlotWrapper.style.top = '25px';
                advertSlotWrapper.style.left = '25px';

                return advertSlotWrapper;
            };

            beforeEach(() => {
                articleBody = document.createElement('div');
                prose = document.createElement('div');

                articleBody.classList.add('article__body');
                prose.classList.add('prose');

                prose.innerHTML = '<p>Hi</p><p>How</p><p>Are</p><p>You?</p>';
                articleBody.appendChild(prose);

                container.appendChild(articleBody);

                config = {
                    mpuAfterParagraphs: 3
                };
            });

            it('call signalDevice with ad_moved if position has changed', function () {
                init(config);

                let advertSlotWrapper = resizedSlotWrapper();

                advertSlotWrapper.style.top = '50px';
                
                const signalDeviceMock = jest.spyOn(util, "signalDevice");
                expect(signalDeviceMock).toHaveBeenCalledTimes(1);
                expect(signalDeviceMock).toHaveBeenCalledWith('ads-ready');
            });

            it('do not call signalDevice with ad_moved if position has not changed', function () {
                init(config);

                const signalDeviceMock = jest.spyOn(util, "signalDevice");
                expect(signalDeviceMock).not.toHaveBeenCalledWith('ad_moved');
            });
        });
    });

    describe('window.updateLiveblogAdPlaceholders(reset)', function () {
        let articleBody;
        let config;

        beforeEach(() => {
            let i;
            let block;

            articleBody = document.createElement('div');
            articleBody.classList.add('article__body');
            container.appendChild(articleBody);

            for (i = 0; i < 10; i++) {
                block = document.createElement('div');
                block.classList.add('block');
                articleBody.appendChild(block);
            }

            config = {
                adsType: 'liveblog'
            };
        });

        it('inserts liveblog ads after 2nd and 7th blocks', function () {
            init(config);

            expect(articleBody.children[2].classList.contains('advert-slot--mpu')).toEqual(true);
            expect(articleBody.children[8].classList.contains('advert-slot--mpu')).toEqual(true);
        });

        it('if reset true replaces liveblog ads and calls signalDevice with ad_moved', function () {
            let placeholderOne;
            let placeholderTwo;

            init(config);

            placeholderOne = articleBody.querySelectorAll('.advert-slot--mpu')[0];
            placeholderTwo = articleBody.querySelectorAll('.advert-slot--mpu')[1];

            window.updateLiveblogAdPlaceholders(true);

            expect(placeholderOne.parentNode).toBeFalsy();
            expect(placeholderTwo.parentNode).toBeFalsy();
            expect(placeholderOne).not.toEqual(articleBody.querySelectorAll('.advert-slot--mpu')[0]);
            expect(placeholderTwo).not.toEqual(articleBody.querySelectorAll('.advert-slot--mpu')[1]);
            
            const signalDeviceMock = jest.spyOn(util, "signalDevice");
            expect(signalDeviceMock).toHaveBeenCalledWith('ads-ready');
            expect(signalDeviceMock).toHaveBeenCalledWith('ad_moved');
        });

        it('if reset true and android calls updateAndroidPosition for liveblog', function () {
            GU.opts.platform = 'android';

            init(config);

            window.updateLiveblogAdPlaceholders(true);

            expect(window.GuardianJSInterface.mpuLiveblogAdsPosition).toHaveBeenCalledTimes(1);
        });
    });

    describe('if there is a contribution epic after the 2nd block', function () {
        let articleBody;
        let config;

        beforeEach(() => {
            let i;
            let block;

            articleBody = document.createElement('div');
            articleBody.classList.add('article__body');

            container.appendChild(articleBody);

            let epic = document.createElement('div');
            epic.classList.add('contributions-epic__container');

            for (i = 0; i < 5; i++) {
                block = document.createElement('div');
                block.classList.add('block', i);
                articleBody.appendChild(block);
            }

            articleBody.insertBefore(epic, articleBody.children[2]);

            config = {
                adsType: 'liveblog'
            };
        });

        it('inserts liveblog ad after the 3rd block instead', function () {
            init(config);

            expect(articleBody.children[4].classList.contains('advert-slot--mpu')).toEqual(true);
        });
    });

    describe('window.initMpuPoller()', function () {
        let advertSlotWrapper;
        let config;

        beforeEach(function () {
            advertSlotWrapper = document.createElement('div');
            advertSlotWrapper.classList.add('advert-slot__wrapper');
            advertSlotWrapper.style.height = '100px';
            advertSlotWrapper.style.width = '100px';
            advertSlotWrapper.style.position = 'absolute';
            advertSlotWrapper.style.top = '25px';
            advertSlotWrapper.style.left = '25px';
            container.appendChild(advertSlotWrapper);

            config = {
                adsType: 'default'
            };
        });

        it('if first run and android updates ad position', function () {
            GU.opts.platform = 'android';

            init(config);

            window.initMpuPoller();

            expect(window.GuardianJSInterface.mpuAdsPosition).toHaveBeenCalledTimes(1);
        });
    });

    describe('getMpuPosCommaSeparated()', function () {
        let articleBody;
        let config;
        const addBlocks = function (count) {
            let i;
            let block;

            for (i = 0; i < count; i++) {
                block = document.createElement('div');
                block.classList.add('block');
                articleBody.appendChild(block);
            }
        };

        beforeEach(() => {
            articleBody = document.createElement('div');
            articleBody.classList.add('article__body');
            container.appendChild(articleBody);

            config = {
                adsType: 'liveblog'
            };
        });

        it('returns dimensions of 1 advertSlotWrapper', function () {
            addBlocks(5);

            init(config);

            const mpuPosCommaSeparated = window.getMpuPosCommaSeparated();
            expect(mpuPosCommaSeparated.split(',').length).toEqual(4);
        });

        it('returns dimensions of 2 advertSlotWrappers', function () {
            addBlocks(10);

            init(config);

            const mpuPosCommaSeparated = window.getMpuPosCommaSeparated();
            expect(mpuPosCommaSeparated.split(',').length).toEqual(4);
        });
    });

    describe('updateMPUPosition(yPos)', function () {
        let config;
        let prose;
        let articleBody;

        beforeEach(function () {
            articleBody = document.createElement('div');
            prose = document.createElement('div');

            articleBody.classList.add('article__body');
            prose.classList.add('prose');

            prose.innerHTML = '<p>Hi</p><p>How</p><p>Are</p><p>You?</p>';
            articleBody.appendChild(prose);

            container.appendChild(articleBody);

            config = {
                mpuAfterParagraphs: 3
            };

            const getElementOffsetMock = jest.spyOn(util, "getElementOffset");
            getElementOffsetMock.mockImplementation(() => {
                return {
                    "width": 100,
                    "height": 100,
                    "left": 25,
                    "top": 25
                };
            });
        });

        it('updates ad position on android if it has changed', function () {
            GU.opts.platform = 'android';

            init(config);

            updateMPUPosition(50);

            expect(window.GuardianJSInterface.mpuAdsPosition).toHaveBeenCalledTimes(1);
        });

        it('updates ad position on ios if it has changed', function () {
            init(config);

            updateMPUPosition(50);
            
            const signalDeviceMock = jest.spyOn(util, "signalDevice");
            expect(signalDeviceMock).toHaveBeenCalledWith('ad_moved');
        });

        it('does not update ad position on android if it has not changed', function () {
            GU.opts.platform = 'android';

            init(config);

            const adSlot = document.getElementsByClassName('advert-slot__wrapper')[0];

            updateMPUPosition(25);

            expect(window.GuardianJSInterface.mpuAdsPosition).not.toHaveBeenCalled();
        });
    });
});