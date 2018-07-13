define([
    'squire'
], function (
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/modules/ads', function () {
        var clock,
            ads,
            sandbox,
            container;

        var utilMock;

        beforeEach(function (done) {
            var injector = new Squire();

            clock = sinon.useFakeTimers();

            sandbox = sinon.sandbox.create();

            container = document.createElement('div');
            container.id = 'container';
            document.body.appendChild(container);

            document.body.classList.add('no-ready');

            window.applyNativeFunctionCall = sandbox.spy();

            window.GuardianJSInterface = {
                mpuLiveblogAdsPosition: sandbox.spy(),
                mpuAdsPosition: sandbox.spy()
            };

            window.GU = {
                opts: {
                    useAdsReady: 'true',
                    platform: 'ios'
                }
            };

            utilMock = {
                signalDevice: sandbox.spy()
            };

            injector
                .mock('modules/util', utilMock)
                .require(['ArticleTemplates/assets/js/modules/ads'], function (sut) {
                    ads = sut;

                    done();
                });
        });

        afterEach(function () {
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

            sandbox.restore();
            clock.restore();
        });

        describe('init(config)', function () {
            var config;

            beforeEach(function () {
                config = {};
            });

            describe('if adsType is liveblog', function () {
                var articleBody;

                beforeEach(function () {
                    var i,
                        html = '';

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

                    ads.init(config);

                    expect(articleBody.children.length).to.eql(10);
                    expect(articleBody.children[2].classList.contains('advert-slot')).to.eql(true);
                    expect(articleBody.children[9].classList.contains('advert-slot')).to.eql(true);

                    expect(window.initMpuPoller).to.not.be.undefined;
                    expect(window.killMpuPoller).to.not.be.undefined;
                    expect(window.getMpuPosCommaSeparated).to.not.be.undefined;

                    expect(window.applyNativeFunctionCall).to.have.been.calledOnce;
                    expect(window.applyNativeFunctionCall).to.have.been.calledWith('initMpuPoller');
                    expect(window.updateLiveblogAdPlaceholders).to.not.be.undefined;
                });
            });

            describe('if adsType is not liveblog', function () {
                var prose,
                    articleBody;

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

                    ads.init(config);

                    expect(window.initMpuPoller).to.not.be.undefined;
                    expect(window.killMpuPoller).to.not.be.undefined;
                    expect(window.getMpuPosCommaSeparated).to.not.be.undefined;

                    expect(window.applyNativeFunctionCall).to.have.been.calledOnce;
                    expect(window.applyNativeFunctionCall).to.have.been.calledWith('initMpuPoller');
                    expect(prose.children[0].classList.contains('advert-slot--placeholder')).to.eql(true);
                    expect(prose.children[4].classList.contains('advert-slot--mpu')).to.eql(true);
                });

                it('does not insert ad placeholder if too few paragraphs', function () {
                    prose.innerHTML = '<p>Hello</p><p>World</p>';

                    ads.init(config);

                    expect(prose.querySelector('.advert-slot--placeholder')).to.be.falsy;
                    expect(prose.querySelector('.advert-slot--mpu')).to.be.falsy;
                });

                it('fires ads ready if has not been fired already', function () {
                    config.mpuAfterParagraphs = 3;
                    config.adsType = 'default';

                    document.body.classList.remove('no-ready');

                    ads.init(config);

                    expect(utilMock.signalDevice).to.have.been.calledWith('ads-ready');
                });

                it('does not fires ads ready if it  has  been fired already', function () {
                    config.mpuAfterParagraphs = 3;
                    config.adsType = 'default';

                    document.body.dataset.useAdsReady = 'true';

                    ads.init(config);

                    expect(utilMock.signalDevice).to.not.have.been.calledWith('ads-ready');
                });
            });

            describe('if ios calls initMpuPoller()', function () {
                var prose,
                    articleBody,
                    resizedSlotWrapper = function () {
                        var advertSlotWrapper = document.querySelector('.advert-slot__wrapper');

                        advertSlotWrapper.style.height = '100px';
                        advertSlotWrapper.style.width = '100px';
                        advertSlotWrapper.style.position = 'absolute';
                        advertSlotWrapper.style.top = '25px';
                        advertSlotWrapper.style.left = '25px';

                        return advertSlotWrapper;
                    };

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
                });

                it('call signalDevice with ad_moved if position has changed', function () {
                    var advertSlotWrapper;

                    ads.init(config);

                    advertSlotWrapper = resizedSlotWrapper();

                    advertSlotWrapper.style.top = '50px';

                    clock.tick(1100);

                    expect(utilMock.signalDevice).to.have.been.calledOnce;
                    expect(utilMock.signalDevice).to.have.been.calledWith('ad_moved');
                });

                it('do not call signalDevice with ad_moved if position has not changed', function () {
                    ads.init(config);

                    clock.tick(1100);

                    expect(utilMock.signalDevice).to.not.have.been.called;
                });
            });
        });

        describe('window.updateLiveblogAdPlaceholders(reset)', function () {
            var articleBody,
                config;

            beforeEach(function () {
                var i,
                    block;

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
                ads.init(config);

                expect(articleBody.children[2].classList.contains('advert-slot--mpu')).to.eql(true);
                expect(articleBody.children[8].classList.contains('advert-slot--mpu')).to.eql(true);
            });

            it('if reset true replaces liveblog ads and calls signalDevice with ad_moved', function () {
                var placeholderOne,
                    placeholderTwo;

                ads.init(config);

                placeholderOne = articleBody.querySelectorAll('.advert-slot--mpu')[0];
                placeholderTwo = articleBody.querySelectorAll('.advert-slot--mpu')[1];

                window.updateLiveblogAdPlaceholders(true);

                expect(placeholderOne.parentNode).to.be.falsy;
                expect(placeholderTwo.parentNode).to.be.falsy;
                expect(placeholderOne).to.not.eql(articleBody.querySelectorAll('.advert-slot--mpu')[0]);
                expect(placeholderTwo).to.not.eql(articleBody.querySelectorAll('.advert-slot--mpu')[1]);
                expect(utilMock.signalDevice).to.have.been.calledOnce;
                expect(utilMock.signalDevice).to.have.been.calledWith('ad_moved');
            });

            it('if reset true and android calls updateAndroidPosition for liveblog', function () {
                GU.opts.platform = 'android';

                ads.init(config);

                window.updateLiveblogAdPlaceholders(true);

                expect(window.GuardianJSInterface.mpuLiveblogAdsPosition).to.have.been.calledOnce;
            });
        });

        describe('if there is a contribution epic after the 2nd block', function () {
            var articleBody,
                config;

            beforeEach(function () {
                var i,
                    block;

                articleBody = document.createElement('div');
                articleBody.classList.add('article__body');

                container.appendChild(articleBody);

                var epic = document.createElement('div');
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
                ads.init(config);

                expect(articleBody.children[4].classList.contains('advert-slot--mpu')).to.eql(true);
            });
        });

        describe('window.initMpuPoller()', function () {
            var advertSlotWrapper,
                config;

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

                ads.init(config);

                window.initMpuPoller();

                clock.tick(1100);

                expect(window.GuardianJSInterface.mpuAdsPosition).to.have.been.calledOnce;
            });

            it('if second run, android and position has changed update ad position', function () {
                GU.opts.platform = 'android';

                ads.init(config);

                window.initMpuPoller();

                advertSlotWrapper.style.top = '50px';

                clock.tick(1100);

                expect(window.GuardianJSInterface.mpuAdsPosition).to.have.been.calledTwice;
            });

            it('if second run, android and position has not changed does not update ad position', function () {
                GU.opts.platform = 'android';

                ads.init(config);

                window.initMpuPoller();

                clock.tick(1100);

                expect(window.GuardianJSInterface.mpuAdsPosition).to.have.been.calledOnce;
            });
        });

        describe('getMpuPosCommaSeparated()', function () {
            var articleBody,
                config,
                addBlocks = function (count) {
                    var i,
                        block;

                    for (i = 0; i < count; i++) {
                        block = document.createElement('div');
                        block.classList.add('block');
                        articleBody.appendChild(block);
                    }
                };

            beforeEach(function () {
                articleBody = document.createElement('div');
                articleBody.classList.add('article__body');
                container.appendChild(articleBody);

                config = {
                    adsType: 'liveblog'
                };
            });

            it('returns dimensions of 1 advertSlotWrapper', function () {
                var mpuPosCommaSeparated;

                addBlocks(5);

                ads.init(config);

                mpuPosCommaSeparated = window.getMpuPosCommaSeparated();

                expect(mpuPosCommaSeparated.split(',').length).to.eql(2);
            });

            it('returns dimensions of 2 advertSlotWrappers', function () {
                var mpuPosCommaSeparated;

                addBlocks(10);

                ads.init(config);

                mpuPosCommaSeparated = window.getMpuPosCommaSeparated();

                expect(mpuPosCommaSeparated.split(',').length).to.eql(4);
            });
        });

        describe('updateMPUPosition(yPos)', function () {
            var config,
                prose,
                articleBody;

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

                utilMock.getElementOffset = sandbox.stub().returns({
                    height: 100,
                    width: 100,
                    top: 25,
                    left: 25
                });
            });

            it('updates ad position on android if it has changed', function () {
                GU.opts.platform = 'android';

                ads.init(config);

                ads.updateMPUPosition(50);

                expect(window.GuardianJSInterface.mpuAdsPosition).to.have.been.calledOnce;
            });

            it('updates ad position on ios if it has changed', function () {
                ads.init(config);

                ads.updateMPUPosition(50);

                expect(utilMock.signalDevice).to.have.been.calledOnce;
                expect(utilMock.signalDevice).to.have.been.calledWith('ad_moved');
            });

            it('does not update ad position on android if it has not changed', function () {
                var adSlot;

                GU.opts.platform = 'android';

                ads.init(config);

                adSlot = document.getElementsByClassName('advert-slot__wrapper')[0];

                ads.updateMPUPosition(25);

                expect(window.GuardianJSInterface.mpuAdsPosition).to.not.have.been.called;
            });

            it('does not update ad position on ios if it has not changed', function () {
                var adSlot;

                ads.init(config);

                adSlot = document.getElementsByClassName('advert-slot__wrapper')[0];

                ads.updateMPUPosition(25);

                expect(utilMock.signalDevice).to.not.have.been.called;
            });
        });
    });
});
