define([
    'modules/util',
    'squire'
], function(
    util,
    Squire
) {
    'use strict';

    describe.only('ArticleTemplates/assets/js/bootstraps/liveblog', function() {
        var dummyCommon,
            container,
            injector;

        var relativeDatesMock,
            twitterMock,
            MyScrollMock,
            adsMock;
            
        beforeEach(function() {
            relativeDatesMock = {};
            twitterMock = {
                checkForTweets: sinon.spy()
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
        });

        afterEach(function () {
            document.body.removeChild(container);

            delete window.GU;
        });

        describe('init()', function () {
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
                        expect(window.showLiveMore).to.not.be.undefined;

                        expect(window.applyNativeFunctionCall).to.have.been.calledWith('liveblogDeleteBlock');
                        expect(window.applyNativeFunctionCall).to.have.been.calledWith('liveblogUpdateBlock');

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
    });
});