define([
    'squire'
], function (
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/modules/outbrain', function () {
        var outbrain,
            sandbox,
            container;

        beforeEach(function (done) {
            var injector = new Squire();

            sandbox = sinon.sandbox.create(); 

            container = document.createElement('div');
            container.id = 'container';
            document.body.appendChild(container);

            window.GU = {
                opts: {
                    adsConfig: 'tablet',
                    section: 'news'
                }
            };

            injector
                .require(['ArticleTemplates/assets/js/modules/outbrain'], function (sut) {
                    outbrain = sut;

                    done();
                });
        });

        afterEach(function () {
            document.body.removeChild(container);

            delete window.GU;

            sandbox.restore();
        });

        describe('init()', function () {
            var outbrainContainer,
                outbrainText,
                outbrainImage;

            beforeEach(function () {
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

                outbrain.init();

                expect(document.getElementById('outbrain-widget')).not.to.be.ok;
            });

            it('does nothing if no outbrainImage.dataset.src not set', function () {
                outbrainImage.dataset.src = '';

                outbrain.init();

                expect(document.getElementById('outbrain-widget')).not.to.be.ok;
            });

            it('sets up outbrain on tablet in news section', function () {
                outbrain.init();

                expect(outbrainText.style.display).to.eql('block');
                expect(outbrainText.dataset.widgetId).to.eql('AR_27');
                expect(outbrainImage.dataset.widgetId).to.eql('AR_24');
                expect(document.getElementById('outbrain-widget')).to.be.ok;
            });

            it('sets up outbrain on tablet in non-news section', function () {
                window.GU.opts.section = 'sport';

                outbrain.init();

                expect(outbrainText.style.display).to.eql('block');
                expect(outbrainText.dataset.widgetId).to.eql('AR_20');
                expect(outbrainImage.dataset.widgetId).to.eql('AR_18');
                expect(document.getElementById('outbrain-widget')).to.be.ok;
            });

            it('sets up outbrain on mobile in news section', function () {
                window.GU.opts.adsConfig = 'mobile';

                outbrain.init();

                expect(outbrainText.parentNode).not.to.be.ok;
                expect(outbrainImage.dataset.widgetId).to.eql('AR_22');
                expect(document.getElementById('outbrain-widget')).to.be.ok;
            });

            it('sets up outbrain on mobile in non-news section', function () {
                window.GU.opts.adsConfig = 'mobile';
                window.GU.opts.section = 'sport';

                outbrain.init();

                expect(outbrainText.parentNode).not.to.be.ok;
                expect(outbrainImage.dataset.widgetId).to.eql('AR_16');
                expect(document.getElementById('outbrain-widget')).to.be.ok;
            });
        });
    });
});