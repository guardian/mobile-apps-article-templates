import { init } from 'modules/outbrain';

describe('ArticleTemplates/assets/js/modules/outbrain', function () {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'container';
        document.body.appendChild(container);

        window.GU = {
            opts: {
                adsConfig: 'tablet',
                section: 'news'
            }
        };
    });

    afterEach(function () {
        document.body.removeChild(container);
        delete window.GU;
    });

    describe('init()', function () {
        let outbrainContainer;
        let outbrainText;
        let outbrainImage;

        beforeEach(() => {
            outbrainContainer = document.createElement('div');
            outbrainContainer.classList.add('container__outbrain');
            container.appendChild(outbrainContainer);

            outbrainImage = document.createElement('div');
            outbrainImage.classList.add('outbrainImage');
            outbrainImage.dataset.src = 'xxx';
            outbrainContainer.appendChild(outbrainImage);

            outbrainText = document.createElement('div');
            outbrainText.classList.add('outbrainText');
            outbrainContainer.appendChild(outbrainText);
        });

        it('does nothing if no outbrain outbrain container', function () {
            container.removeChild(outbrainContainer);
            init();
            expect(document.getElementById('outbrain-widget')).toBeFalsy();
        });

        it('does nothing if no outbrainImage.dataset.src not set', function () {
            outbrainImage.dataset.src = '';
            init();
            expect(document.getElementById('outbrain-widget')).toBeFalsy();
        });

        it('sets up outbrain on tablet in news section', function () {
            init();

            expect(outbrainText.style.display).toEqual('block');
            expect(outbrainText.dataset.widgetId).toEqual('AR_27');
            expect(outbrainImage.dataset.widgetId).toEqual('AR_24');
            expect(document.getElementById('outbrain-widget')).toBeTruthy();
        });

        it('sets up outbrain on tablet in non-news section', function () {
            window.GU.opts.section = 'sport';

            init();

            expect(outbrainText.style.display).toEqual('block');
            expect(outbrainText.dataset.widgetId).toEqual('AR_20');
            expect(outbrainImage.dataset.widgetId).toEqual('AR_18');
            expect(document.getElementById('outbrain-widget')).toBeTruthy();
        });

        it('sets up outbrain on mobile in news section', function () {
            window.GU.opts.adsConfig = 'mobile';

            init();

            expect(outbrainText.parentNode).toBeFalsy();
            expect(outbrainImage.dataset.widgetId).toEqual('AR_22');
            expect(document.getElementById('outbrain-widget')).toBeTruthy();
        });

        it('sets up outbrain on mobile in non-news section', function () {
            window.GU.opts.adsConfig = 'mobile';
            window.GU.opts.section = 'sport';

            init();

            expect(outbrainText.parentNode).toBeFalsy();
            expect(outbrainImage.dataset.widgetId).toEqual('AR_16');
            expect(document.getElementById('outbrain-widget')).toBeTruthy();
        });
    });
});