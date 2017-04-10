define([
    'squire'
], function(
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

    describe.only('ArticleTemplates/assets/js/bootstraps/common', function() {
        var injector,
            sandbox;
            
        var fenceMock,
            fastClickMock,
            smoothScrollMock,
            commentsMock,
            cardsMock,
            moreTagsMock,
            sharingMock,
            utilMock;

        beforeEach(function() {
            sandbox = sinon.sandbox.create();

            fenceMock = {
                render: sandbox.spy()
            };
            fastClickMock = {
                attach: sandbox.spy()
            };
            smoothScrollMock = {
                init: sandbox.spy()
            };
            commentsMock = {
                init: sandbox.spy()
            };
            cardsMock = {
                init: sandbox.spy()
            };
            moreTagsMock = {
                init: sandbox.spy()
            };
            sharingMock = {
                init: sandbox.spy()
            };
            utilMock = {
                getClosestParentWithTag: sandbox.spy(),
                getElementOffset: sandbox.stub().returns({
                    width: 400
                }),
                debounce: sandbox.spy()
            };
            
            injector = new Squire();
            
            window.GU = {
                opts: {
                    isOffline: false
                }
            };
        });

        afterEach(function () {
            sandbox.restore();
            delete window.GU;
        });

        describe('formatImages(images)', function () {
            var articleElem,
                figElem,
                opts,
                dummyImage,
                origImage,
                common;
                
            beforeEach(function (done) {
                // stub Image to test onerror handling
                dummyImage = {};
                origImage = window.Image;
                window.Image = sinon.stub().returns(dummyImage);
                
                // add article element to page, we inject figElem into this element
                articleElem = document.createElement('div');
                articleElem.classList.add('article');
                document.body.appendChild(articleElem);
             
                // default image is thumbnail with caption
                opts = {
                    isThumbnail: true,
                    hasCaption: true
                };

                // mock util method getClosestParentWithTag to return figElem
                utilMock.getClosestParentWithTag = function () {
                    return figElem;
                };

                injector
                    .mock('fence', fenceMock)
                    .mock('fastClick', fastClickMock)
                    .mock('smoothScroll', smoothScrollMock)
                    .mock('modules/comments', commentsMock)
                    .mock('modules/cards', cardsMock)
                    .mock('modules/more-tags', moreTagsMock)
                    .mock('modules/sharing', sharingMock)
                    .mock('modules/util', utilMock)
                    .require(['ArticleTemplates/assets/js/bootstraps/common'], function (sut) {
                        common = sut;
                        done();
                    });
            });

            afterEach(function () {
                // window.Image = origImage;
                document.body.removeChild(articleElem);
            });

            it('hides figure caption if empty', function () {
                opts.figCaption = '';

                figElem = buildFigElem(opts);
          
                articleElem.appendChild(figElem);

                common.formatImages();

                expect(figElem.querySelector('figcaption').style.display).to.eql('none');
            });

            it('does not hide figure caption if not empty', function () {
                opts.figCaption = 'hello world';

                figElem = buildFigElem(opts);

                articleElem.appendChild(figElem);

                common.formatImages();

                expect(figElem.querySelector('figcaption').style.display).to.not.eql('none');
            });

            it('adds image wrapper if first child of figure does not have class figure__inner', function () {
                figElem = buildFigElem(opts);

                articleElem.appendChild(figElem);

                common.formatImages();

                expect(figElem.firstChild.classList.contains('figure__inner')).to.be.true;
                expect(figElem.firstChild.firstChild.tagName).to.eql('IMG');
            });

            it('set image wrapper height for thumbnail images', function () {
                opts.isThumbnail = true;

                figElem = buildFigElem(opts);

                articleElem.appendChild(figElem);

                common.formatImages();

                var imageWrapper = figElem.querySelector('.figure__inner');

                expect(imageWrapper).to.be.ok;
                expect(imageWrapper.style.height).to.eql('300px');
            });

            it('set image wrapper height for figure-wide images', function () {
                opts.isThumbnail = false;
                opts.isFigureWide = true;

                figElem = buildFigElem(opts);

                articleElem.appendChild(figElem);

                common.formatImages();

                var imageWrapper = figElem.querySelector('.figure__inner');

                expect(imageWrapper).to.be.ok;
                expect(imageWrapper.style.height).to.eql('300px');
            });

            it('do not set image wrapper height if it is minute layout', function () {
                GU.opts.isMinute = 'minute';

                opts.isThumbnail = false;
                opts.isFigureWide = true;

                figElem = buildFigElem(opts);

                articleElem.appendChild(figElem);

                common.formatImages();

                var imageWrapper = figElem.querySelector('.figure__inner');

                expect(imageWrapper).to.be.ok;
                expect(imageWrapper.style.height).to.eql('');
            });

            it('adds icon to caption if not present', function () {
                opts.figCaption = 'hello world';

                figElem = buildFigElem(opts);

                articleElem.appendChild(figElem);

                common.formatImages();

                var captionIcon = figElem.querySelector('.element-image__caption').firstChild;

                expect(captionIcon).to.be.ok;
                expect(captionIcon.tagName).to.eql('SPAN');
                expect(captionIcon.classList.contains('figure__caption__icon')).to.be.true;   
                expect(captionIcon.parentNode.innerText).to.eql('hello world');
            });

            it('adds figure-wide class to figure if not a thumbnail', function () {
                opts.isThumbnail = false;

                figElem = buildFigElem(opts);

                articleElem.appendChild(figElem);

                common.formatImages();

                expect(figElem.classList.contains('figure-wide')).to.be.true;
            });

            it('adds figure--thumbnail-with-caption class to figure a thumbnail with caption', function () {
                figElem = buildFigElem(opts);

                articleElem.appendChild(figElem);

                common.formatImages();

                expect(figElem.classList.contains('figure--thumbnail-with-caption')).to.be.true;
            });

            it('adds figure--thumbnail class to figure a thumbnail without caption', function () {
                opts.hasCaption = false;    

                figElem = buildFigElem(opts);

                articleElem.appendChild(figElem);

                common.formatImages();

                expect(figElem.classList.contains('figure--thumbnail')).to.be.true;
            });

            it('adds portrait class to portrait thumbnail', function (done) {
                opts.isPortrait = true;

                figElem = buildFigElem(opts);

                articleElem.appendChild(figElem);

                common.formatImages();

                expect(figElem.classList.contains('portrait-thumbnail')).to.be.true;
                
                done();
            });

            it('adds landscape class to landscape thumbnail', function (done) {
                opts.isPortrait = false;

                figElem = buildFigElem(opts);

                articleElem.appendChild(figElem);

                common.formatImages();

                expect(figElem.classList.contains('landscape-thumbnail')).to.be.true;
                
                done();
            });

            it('hide unavailable image if parentNode has class element-image-inner', function () {
                GU.opts.isOffline = true;

                figElem = buildFigElem(opts);

                articleElem.appendChild(figElem);

                common.formatImages();

                expect(dummyImage.onerror).to.be.defined;
                expect(dummyImage.src).to.eql('xxx');

                figElem.firstChild.classList.add('element-image-inner');

                dummyImage.onerror();

                expect(figElem.querySelector('img').style.display).to.eql('none');
            });

            it('replace unavailable image with placeholder if parentNode does not have class element-image-inner', function () {
                GU.opts.isOffline = true;

                figElem = buildFigElem(opts);

                articleElem.appendChild(figElem);

                common.formatImages();

                expect(dummyImage.onerror).to.be.defined;
                expect(dummyImage.src).to.eql('xxx');

                dummyImage.onerror();

                expect(figElem.querySelectorAll('img').length).to.eql(0);

                var placeholder = figElem.querySelector('.element-image-inner');

                expect(placeholder).to.be.ok;
                expect(placeholder.getAttribute('height')).to.eql('75');
                expect(placeholder.getAttribute('width')).to.eql('100');
            });
        });
    });
});