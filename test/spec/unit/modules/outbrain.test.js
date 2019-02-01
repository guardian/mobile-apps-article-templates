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
        let outbrainWidget;

        beforeEach(() => {
            outbrainContainer = document.createElement('div');
            outbrainContainer.classList.add('container__outbrain');
            container.appendChild(outbrainContainer);

            outbrainWidget = document.createElement('div');
            outbrainWidget.classList.add('OUTBRAIN');
            outbrainWidget.dataset.src = 'xxx';
            outbrainContainer.appendChild(outbrainWidget);
        });

        it('does nothing if no outbrain outbrain container', function () {
            container.removeChild(outbrainContainer);
            init();
            expect(document.getElementById('outbrain-widget')).toBeFalsy();
        });

        it('does nothing if no outbrainImage.dataset.src not set', function () {
            outbrainWidget.dataset.src = '';
            init();
            expect(document.getElementById('outbrain-widget')).toBeFalsy();
        });

        it('sets up outbrain on non compliant tablet', function () {
            window.GU.opts.contentType = 'liveblog';
            window.GU.opts.adsConfig = 'tablet';
            init();

            expect(outbrainWidget.dataset.widgetId).toEqual('AR_20');
            expect(document.getElementById('outbrain-widget')).toBeTruthy();
        });

        it('sets up outbrain on compliant tablet with epic', function () {
            window.GU.opts.contentType = 'article';
            window.GU.opts.adsConfig = 'tablet';
            GU.opts.hasEpic = true;
            init();

            expect(outbrainWidget.dataset.widgetId).toEqual('AR_24');
            expect(document.getElementById('outbrain-widget')).toBeTruthy();
        });

        it('sets up outbrain on compliant tablet without epic', function () {
            window.GU.opts.contentType = 'article';
            window.GU.opts.adsConfig = 'tablet';
            GU.opts.hasEpic = false;
            init();

            expect(outbrainWidget.dataset.widgetId).toEqual('AR_18');
            expect(document.getElementById('outbrain-widget')).toBeTruthy();
        });

        it('sets up outbrain on non compliant mobile', function () {
            window.GU.opts.contentType = 'liveblog';
            window.GU.opts.adsConfig = 'mobile';
            init();

            expect(outbrainWidget.dataset.widgetId).toEqual('AR_29');
            expect(document.getElementById('outbrain-widget')).toBeTruthy();
        });

        it('sets up outbrain on compliant mobile with epic', function () {
            window.GU.opts.contentType = 'article';
            window.GU.opts.adsConfig = 'mobile';
            GU.opts.hasEpic = true;
            init();

            expect(outbrainWidget.dataset.widgetId).toEqual('AR_22');
            expect(document.getElementById('outbrain-widget')).toBeTruthy();
        });

        it('sets up outbrain on compliant mobile without epic', function () {
            window.GU.opts.contentType = 'article';
            window.GU.opts.adsConfig = 'mobile';
            GU.opts.hasEpic = false;
            init();

            expect(outbrainWidget.dataset.widgetId).toEqual('AR_16');
            expect(document.getElementById('outbrain-widget')).toBeTruthy();
        });
    });
});