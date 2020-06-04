import { init, formatImages } from 'bootstraps/common';

jest.mock('fence', () => {});

function buildFigElem (opts) {
    let figElem = document.createElement('figure');
    let imgElem = document.createElement('img');
    let figCaptionElem;

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

describe('ArticleTemplates/assets/js/bootstraps/common', function () {
    beforeEach(() => {
        window.GU = {
            opts: {
                isOffline: false
            }
        };
    });

    afterEach(() => {
        delete window.GU;
    });

    describe('formatImages(images)', function () {
        let articleElem;
        let figElem;
        let opts;
        let dummyImage;
        let origImage;
            
        beforeEach(() => {
            // stub Image to test onerror handling
            dummyImage = {};
            origImage = window.Image;
            window.Image = jest.fn().mockReturnValueOnce(dummyImage);
            
            // add article element to page, we inject figElem into this element
            articleElem = document.createElement('div');
            articleElem.classList.add('article');
            document.body.appendChild(articleElem);
         
            // default image is thumbnail with caption
            opts = {
                isThumbnail: true,
                hasCaption: true
            };
        });

        afterEach(() => {
            // window.Image = origImage;
            document.body.removeChild(articleElem);
        });

        it('adds image wrapper if first child of figure does not have class figure__inner', function () {
            figElem = buildFigElem(opts);

            articleElem.appendChild(figElem);

            formatImages();

            expect(figElem.firstChild.classList.contains('figure__inner')).toBe(true);
            expect(figElem.firstChild.firstChild.tagName).toEqual('IMG');
        });


        it('set image wrapper height for thumbnail images', function () {
            opts.isThumbnail = true;

            figElem = buildFigElem(opts);

            articleElem.appendChild(figElem);

            formatImages();

            const imageWrapper = figElem.querySelector('.figure__inner');
            expect(imageWrapper).toBeTruthy();
        });


        it('adds icon to caption if not present', function () {
            opts.figCaption = 'hello world';

            figElem = buildFigElem(opts);

            articleElem.appendChild(figElem);

            formatImages();

            const captionIcon = figElem.querySelector('.element-image__caption').firstChild;

            expect(captionIcon).toBeTruthy();
            expect(captionIcon.tagName).toEqual('SPAN');
            expect(captionIcon.classList.contains('figure__caption__icon')).toBe(true);   
            expect(captionIcon.parentNode.innerText).toEqual('hello world');
        });

        it('adds figure-wide class to figure if not a thumbnail', function () {
            opts.isThumbnail = false;

            figElem = buildFigElem(opts);

            articleElem.appendChild(figElem);

            formatImages();

            expect(figElem.classList.contains('figure-wide')).toBe(true);
        });

        it('adds figure--thumbnail-with-caption class to figure a thumbnail with caption', function () {
            figElem = buildFigElem(opts);

            articleElem.appendChild(figElem);

            formatImages();

            expect(figElem.classList.contains('figure--thumbnail-with-caption')).toBe(true);
        });


        it('adds figure--thumbnail class to figure a thumbnail without caption', function () {
            opts.hasCaption = false;    

            figElem = buildFigElem(opts);

            articleElem.appendChild(figElem);

            formatImages();

            expect(figElem.classList.contains('figure--thumbnail')).toBe(true);
        });

        it('adds portrait class to portrait thumbnail', function (done) {
            opts.isPortrait = true;

            figElem = buildFigElem(opts);

            articleElem.appendChild(figElem);

            formatImages();

            expect(figElem.classList.contains('portrait-thumbnail')).toBe(true);
            
            done();
        });

        it('adds landscape class to landscape thumbnail', function (done) {
            opts.isPortrait = false;

            figElem = buildFigElem(opts);

            articleElem.appendChild(figElem);

            formatImages();

            expect(figElem.classList.contains('landscape-thumbnail')).toBe(true);
            
            done();
        });
    });
});