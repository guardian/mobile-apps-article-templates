define([
    'modules/util',
    'squire'
], function(
    util,
    Squire
) {
    'use strict';

    function buildFigElem (opts) {
        var figElem = document.createElement('figure'),
            imgElem = document.createElement('img'),
            figCaptionElem;

        figElem.classList.add('element-image');

        imgElem.setAttribute('src', 'xxx');
 
        figElem.appendChild(imgElem);
        
        if (opts.isThumbnail) {
            figElem.classList.add('element--thumbnail');
        }

        if (opts.isFigureWide) {
            figElem.classList.add('figure-wide');
        }

        if (opts.hasCaption) {
            figCaptionElem = document.createElement('figcaption');
            figCaptionElem.classList.add('element-image__caption');
            figElem.appendChild(figCaptionElem);
            figCaptionElem.innerText = opts.figCaption;
        }

        if (opts.isPortrait) {
            imgElem.setAttribute('height', 100);
            imgElem.setAttribute('width', 75);
        } else {
            imgElem.setAttribute('height', 75);
            imgElem.setAttribute('width', 100);
        }

        return figElem;
    }

    describe('ArticleTemplates/assets/js/bootstraps/common', function() {
        var injector,
            sandbox;
            
        var fenceMock,
            fastClickMock,
            FontFaceObserverMock,
            smoothScrollMock,
            commentsMock,
            cardsMock,
            moreTagsMock,
            sharingMock;

        beforeEach(function() {
            fenceMock = {
                render: sinon.spy()
            };
            fastClickMock = {
                attach: sinon.spy()
            };
            FontFaceObserverMock = sinon.spy();
            smoothScrollMock = {
                init: sinon.spy()
            };
            commentsMock = {
                init: sinon.spy()
            };
            cardsMock = {
                init: sinon.spy()
            };
            moreTagsMock = {
                refresh: sinon.spy()
            };
            sharingMock = {
                init: sinon.spy()
            };

            sandbox = sinon.sandbox.create();
            
            injector = new Squire();
            
            window.GU = {
                opts: {
                    isOffline: false
                }
            };

            util.init();
        });

        afterEach(function () {
            sandbox.restore();
            delete window.GU;
        });

        describe('formatImages(images)', function () {
            var articleElem,
                opts,
                dummyImage,
                origImage;
                
            beforeEach(function () {
                dummyImage = {};
                origImage = window.Image;
                window.Image = sinon.stub().returns(dummyImage);
                articleElem = document.createElement('div');
                articleElem.classList.add('article');
                document.body.appendChild(articleElem);
                // default image is thumbnail with caption
                opts = {
                    isThumbnail: true,
                    hasCaption: true
                };
            });

            afterEach(function () {
                window.Image = origImage;
                document.body.removeChild(articleElem);
            });

            it('hides figure caption if empty', function (done) {
               injector
                    .mock('fence', fenceMock)
                    .mock('fastClick', fastClickMock)
                    .mock('fontFaceObserver', FontFaceObserverMock)
                    .mock('smoothScroll', smoothScrollMock)
                    .mock('modules/comments', commentsMock)
                    .mock('modules/cards', cardsMock)
                    .mock('modules/more-tags', moreTagsMock)
                    .mock('modules/sharing', sharingMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/common'], function (common) {
                        opts.figCaption = '';

                        var figElem = buildFigElem(opts);

                        articleElem.appendChild(figElem);

                        common.formatImages();

                        expect(figElem.querySelector('figcaption').style.display).to.eql('none');

                        done();
                    });
            });

            it('does not hide figure caption if not empty', function (done) {
               injector
                    .mock('fence', fenceMock)
                    .mock('fastClick', fastClickMock)
                    .mock('fontFaceObserver', FontFaceObserverMock)
                    .mock('smoothScroll', smoothScrollMock)
                    .mock('modules/comments', commentsMock)
                    .mock('modules/cards', cardsMock)
                    .mock('modules/more-tags', moreTagsMock)
                    .mock('modules/sharing', sharingMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/common'], function (common) {
                        opts.figCaption = 'hello world';

                        var figElem = buildFigElem(opts);

                        articleElem.appendChild(figElem);

                        common.formatImages();

                        expect(figElem.querySelector('figcaption').style.display).to.not.eql('none');

                        done();
                    });
            });

            it('adds image wrapper if first child of figure does not have class figure__inner', function (done) {
                injector
                    .mock('fence', fenceMock)
                    .mock('fastClick', fastClickMock)
                    .mock('fontFaceObserver', FontFaceObserverMock)
                    .mock('smoothScroll', smoothScrollMock)
                    .mock('modules/comments', commentsMock)
                    .mock('modules/cards', cardsMock)
                    .mock('modules/more-tags', moreTagsMock)
                    .mock('modules/sharing', sharingMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/common'], function (common) {
                        var figElem = buildFigElem(opts);

                        articleElem.appendChild(figElem);

                        common.formatImages();

                        expect(figElem.firstChild.classList.contains('figure__inner')).to.be.true;
                        expect(figElem.firstChild.firstChild.tagName).to.eql('IMG');

                        done();
                    });
            });

            it('set image wrapper height for thumbnail images', function (done) {
                injector
                    .mock('fence', fenceMock)
                    .mock('fastClick', fastClickMock)
                    .mock('fontFaceObserver', FontFaceObserverMock)
                    .mock('smoothScroll', smoothScrollMock)
                    .mock('modules/comments', commentsMock)
                    .mock('modules/cards', cardsMock)
                    .mock('modules/more-tags', moreTagsMock)
                    .mock('modules/sharing', sharingMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/common'], function (common) {
                        opts.isThumbnail = true;

                        var figElem = buildFigElem(opts);

                        articleElem.appendChild(figElem);

                        common.formatImages();

                        var imageWrapper = figElem.querySelector('.figure__inner');

                        expect(imageWrapper).to.be.ok;
                        expect(imageWrapper.style.height).to.eql('228px');
                        
                        done();
                    });
            });

            it('set image wrapper height for figure-wide images', function (done) {
                injector
                    .mock('fence', fenceMock)
                    .mock('fastClick', fastClickMock)
                    .mock('fontFaceObserver', FontFaceObserverMock)
                    .mock('smoothScroll', smoothScrollMock)
                    .mock('modules/comments', commentsMock)
                    .mock('modules/cards', cardsMock)
                    .mock('modules/more-tags', moreTagsMock)
                    .mock('modules/sharing', sharingMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/common'], function (common) {
                        opts.isThumbnail = false;
                        opts.isFigureWide = true;

                        var figElem = buildFigElem(opts);

                        articleElem.appendChild(figElem);

                        common.formatImages();

                        var imageWrapper = figElem.querySelector('.figure__inner');

                        expect(imageWrapper).to.be.ok;
                        expect(imageWrapper.style.height).to.eql('228px');
                        
                        done();
                    });
            });

            it('do not set image wrapper height if it is minute layout', function (done) {
                injector
                    .mock('fence', fenceMock)
                    .mock('fastClick', fastClickMock)
                    .mock('fontFaceObserver', FontFaceObserverMock)
                    .mock('smoothScroll', smoothScrollMock)
                    .mock('modules/comments', commentsMock)
                    .mock('modules/cards', cardsMock)
                    .mock('modules/more-tags', moreTagsMock)
                    .mock('modules/sharing', sharingMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/common'], function (common) {
                        GU.opts.isMinute = 'minute';

                        opts.isThumbnail = false;
                        opts.isFigureWide = true;

                        var figElem = buildFigElem(opts);

                        articleElem.appendChild(figElem);

                        common.formatImages();

                        var imageWrapper = figElem.querySelector('.figure__inner');

                        expect(imageWrapper).to.be.ok;
                        expect(imageWrapper.style.height).to.eql('');
                        
                        done();
                    });
            });

            it('adds icon to caption if not present', function (done) {
                injector
                    .mock('fence', fenceMock)
                    .mock('fastClick', fastClickMock)
                    .mock('fontFaceObserver', FontFaceObserverMock)
                    .mock('smoothScroll', smoothScrollMock)
                    .mock('modules/comments', commentsMock)
                    .mock('modules/cards', cardsMock)
                    .mock('modules/more-tags', moreTagsMock)
                    .mock('modules/sharing', sharingMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/common'], function (common) {
                        opts.figCaption = 'hello world';

                        var figElem = buildFigElem(opts);

                        articleElem.appendChild(figElem);

                        common.formatImages();

                        var captionIcon = figElem.querySelector('.element-image__caption').firstChild;

                        expect(captionIcon).to.be.ok;
                        expect(captionIcon.tagName).to.eql('SPAN');
                        expect(captionIcon.classList.contains('figure__caption__icon')).to.be.true;   
                        expect(captionIcon.parentNode.innerText).to.eql('hello world');

                        done();
                    });
            });

            it('adds figure-wide class to figure if not a thumbnail', function (done) {
                injector
                    .mock('fence', fenceMock)
                    .mock('fastClick', fastClickMock)
                    .mock('fontFaceObserver', FontFaceObserverMock)
                    .mock('smoothScroll', smoothScrollMock)
                    .mock('modules/comments', commentsMock)
                    .mock('modules/cards', cardsMock)
                    .mock('modules/more-tags', moreTagsMock)
                    .mock('modules/sharing', sharingMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/common'], function (common) {
                        opts.isThumbnail = false;

                        var figElem = buildFigElem(opts);

                        articleElem.appendChild(figElem);

                        common.formatImages();

                        expect(figElem.classList.contains('figure-wide')).to.be.true;
                        
                        done();
                    });
            });

            it('adds figure--thumbnail-with-caption class to figure a thumbnail with caption', function (done) {
                injector
                    .mock('fence', fenceMock)
                    .mock('fastClick', fastClickMock)
                    .mock('fontFaceObserver', FontFaceObserverMock)
                    .mock('smoothScroll', smoothScrollMock)
                    .mock('modules/comments', commentsMock)
                    .mock('modules/cards', cardsMock)
                    .mock('modules/more-tags', moreTagsMock)
                    .mock('modules/sharing', sharingMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/common'], function (common) {
                        var figElem = buildFigElem(opts);

                        articleElem.appendChild(figElem);

                        common.formatImages();

                        expect(figElem.classList.contains('figure--thumbnail-with-caption')).to.be.true;
                        
                        done();
                    });
            });

            it('adds figure--thumbnail class to figure a thumbnail without caption', function (done) {
                injector
                    .mock('fence', fenceMock)
                    .mock('fastClick', fastClickMock)
                    .mock('fontFaceObserver', FontFaceObserverMock)
                    .mock('smoothScroll', smoothScrollMock)
                    .mock('modules/comments', commentsMock)
                    .mock('modules/cards', cardsMock)
                    .mock('modules/more-tags', moreTagsMock)
                    .mock('modules/sharing', sharingMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/common'], function (common) {
                        opts.hasCaption = false;    

                        var figElem = buildFigElem(opts);

                        articleElem.appendChild(figElem);

                        common.formatImages();

                        expect(figElem.classList.contains('figure--thumbnail')).to.be.true;
                        
                        done();
                    });
            });

            it('adds portrait class to portrait thumbnail', function (done) {
                injector
                    .mock('fence', fenceMock)
                    .mock('fastClick', fastClickMock)
                    .mock('fontFaceObserver', FontFaceObserverMock)
                    .mock('smoothScroll', smoothScrollMock)
                    .mock('modules/comments', commentsMock)
                    .mock('modules/cards', cardsMock)
                    .mock('modules/more-tags', moreTagsMock)
                    .mock('modules/sharing', sharingMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/common'], function (common) {
                        opts.isPortrait = true;

                        var figElem = buildFigElem(opts);

                        articleElem.appendChild(figElem);

                        common.formatImages();

                        expect(figElem.classList.contains('portrait-thumbnail')).to.be.true;
                        
                        done();
                    });
            });

            it('adds landscape class to landscape thumbnail', function (done) {
                injector
                    .mock('fence', fenceMock)
                    .mock('fastClick', fastClickMock)
                    .mock('fontFaceObserver', FontFaceObserverMock)
                    .mock('smoothScroll', smoothScrollMock)
                    .mock('modules/comments', commentsMock)
                    .mock('modules/cards', cardsMock)
                    .mock('modules/more-tags', moreTagsMock)
                    .mock('modules/sharing', sharingMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/common'], function (common) {
                        opts.isPortrait = false;

                        var figElem = buildFigElem(opts);

                        articleElem.appendChild(figElem);

                        common.formatImages();

                        expect(figElem.classList.contains('landscape-thumbnail')).to.be.true;
                        
                        done();
                    });
            });

            it('hide unavailable image if parentNode has class element-image-inner', function (done) {
                injector
                    .mock('fence', fenceMock)
                    .mock('fastClick', fastClickMock)
                    .mock('fontFaceObserver', FontFaceObserverMock)
                    .mock('smoothScroll', smoothScrollMock)
                    .mock('modules/comments', commentsMock)
                    .mock('modules/cards', cardsMock)
                    .mock('modules/more-tags', moreTagsMock)
                    .mock('modules/sharing', sharingMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/common'], function (common) {
                        var figElem = buildFigElem(opts);
                        
                        GU.opts.isOffline = true;

                        articleElem.appendChild(figElem);

                        common.formatImages();

                        expect(dummyImage.onerror).to.be.defined;
                        expect(dummyImage.src).to.eql('xxx');

                        figElem.firstChild.classList.add('element-image-inner');

                        dummyImage.onerror();

                        expect(figElem.querySelector('img').style.display).to.eql('none');

                        done();
                    });
            });

            it('replace unavailable image with placeholder if parentNode does not have class element-image-inner', function (done) {
                injector
                    .mock('fence', fenceMock)
                    .mock('fastClick', fastClickMock)
                    .mock('fontFaceObserver', FontFaceObserverMock)
                    .mock('smoothScroll', smoothScrollMock)
                    .mock('modules/comments', commentsMock)
                    .mock('modules/cards', cardsMock)
                    .mock('modules/more-tags', moreTagsMock)
                    .mock('modules/sharing', sharingMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/common'], function (common) {
                        var figElem = buildFigElem(opts);

                        GU.opts.isOffline = true;

                        articleElem.appendChild(figElem);

                        sandbox.stub(window.GU.util, 'getElementOffset').returns({
                            width: 304
                        });

                        common.formatImages();

                        expect(dummyImage.onerror).to.be.defined;
                        expect(dummyImage.src).to.eql('xxx');

                        dummyImage.onerror();

                        expect(figElem.querySelectorAll('img').length).to.eql(0);

                        var placeholder = figElem.querySelector('.element-image-inner');

                        expect(placeholder).to.be.ok;
                        expect(placeholder.getAttribute('height')).to.eql('75');
                        expect(placeholder.getAttribute('width')).to.eql('100');
                        
                        done();
                    });
            });
        });
    });
});