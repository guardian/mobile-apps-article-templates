import * as boot from 'boot';
import * as ads from 'modules/ads';

describe('ArticleTemplates/assets/js/app', function () {
    describe('init()', function () {
        describe('initialising layouts', function () {
            beforeEach(() => {
                jest.spyOn(boot, 'go').mockImplementation(() => jest.fn())

                window.GU = {
                    opts: {
                        adsEnabled: 'true',
                        adsConfig: 'xxx',
                        contentType: 'liveblog',
                        mpuAfterParagraphs: 0,
                        templatesDirectory: "",
                        test: true
                    }
                };
            });

            afterEach(() => {                
                delete window.GU;
            });

            it('does not initialise ads module if GU.opts.adsEnabled is "false"', function () {
                window.GU.opts.contentType = 'article';
                window.GU.opts.adsEnabled = 'false';
                boot.init(window.GU.opts);
                
                const initMock = jest.spyOn(ads, 'init').mockImplementation(() => jest.fn())
                expect(initMock).not.toHaveBeenCalled();
            });

            it('initialises ads module if GU.opts.adsEnabled contains "mpu"', function () {
                window.GU.opts.contentType = 'article';
                window.GU.opts.adsEnabled = 'mpu';

                boot.init(window.GU.opts);
                
                const initMock = jest.spyOn(ads, 'init').mockImplementation(() => jest.fn())
                expect(initMock).toHaveBeenCalled();
                expect(initMock).toHaveBeenCalledWith({
                    adsConfig: 'xxx',
                    adsType: 'default',
                    mpuAfterParagraphs: 0
                });
            });

            it('initialises article if GU.opts.contentType is article', function () {
                window.GU.opts.contentType = 'article';

                boot.init(window.GU.opts);
                
                const initMock = jest.spyOn(ads, 'init').mockImplementation(() => jest.fn())
                expect(initMock).toHaveBeenCalled();
                expect(initMock).toHaveBeenCalledWith({
                    adsConfig: 'xxx',
                    adsType: 'default',
                    mpuAfterParagraphs: 0
                });
            });

            it('initialises liveblog if GU.opts.contentType is liveblog', function () {
                window.GU.opts.contentType = 'liveblog';
                window.GU.opts.isMinute = false;

                boot.init(window.GU.opts);
                
                const initMock = jest.spyOn(ads, 'init').mockImplementation(() => jest.fn())
                expect(initMock).toHaveBeenCalled();
                expect(initMock).toHaveBeenCalledWith({
                    adsConfig: 'xxx',
                    adsType: 'liveblog',
                    mpuAfterParagraphs: 0
                });
            });

            it('set adsType to default if liveblog and GU.opts.isMinute is truthy', function () {
                window.GU.opts.contentType = 'liveblog';
                window.GU.opts.isMinute = true;

                boot.init(window.GU.opts);
                
                const initMock = jest.spyOn(ads, 'init').mockImplementation(() => jest.fn())
                expect(initMock).toHaveBeenCalled();
                expect(initMock).toHaveBeenCalledWith({
                    adsConfig: 'xxx',
                    adsType: 'default',
                    mpuAfterParagraphs: 0
                });
            });

            it('set adsType to liveblog if page contains .article__body--liveblog', function () {
                var liveblogElem = document.createElement('div');

                liveblogElem.classList.add('article__body--liveblog');

                document.body.appendChild(liveblogElem);

                window.GU.opts.contentType = 'football';

                boot.init(window.GU.opts);
                
                const initMock = jest.spyOn(ads, 'init').mockImplementation(() => jest.fn())
                expect(initMock).toHaveBeenCalled();
                expect(initMock).toHaveBeenCalledWith({
                    adsConfig: 'xxx',
                    adsType: 'liveblog',
                    mpuAfterParagraphs: 0
                });

                liveblogElem.remove();
            });

            it('initialises audio if GU.opts.contentType is audio', function () {
                window.GU.opts.contentType = 'audio';
      
                boot.init(window.GU.opts);
                
                const initMock = jest.spyOn(ads, 'init').mockImplementation(() => jest.fn())
                expect(initMock).toHaveBeenCalled();
                expect(initMock).toHaveBeenCalledWith({
                    adsConfig: 'xxx',
                    adsType: 'default',
                    mpuAfterParagraphs: 0
                });
            });

            it('initialises gallery if GU.opts.contentType is gallery', function () {
                window.GU.opts.contentType = 'gallery';
       
                boot.init(window.GU.opts);
                
                const initMock = jest.spyOn(ads, 'init').mockImplementation(() => jest.fn())
                expect(initMock).toHaveBeenCalled();
                expect(initMock).toHaveBeenCalledWith({
                    adsConfig: 'xxx',
                    adsType: 'default',
                    mpuAfterParagraphs: 0
                });
            });

            it('initialises football if GU.opts.contentType is football', function () {
                window.GU.opts.contentType = 'football';

                boot.init(window.GU.opts);
                
                const initMock = jest.spyOn(ads, 'init').mockImplementation(() => jest.fn())
                expect(initMock).toHaveBeenCalled();
                expect(initMock).toHaveBeenCalledWith({
                    adsConfig: 'xxx',
                    adsType: 'default',
                    mpuAfterParagraphs: 0
                });
            });

            it('initialises cricket if GU.opts.contentType is cricket', function () {
                window.GU.opts.contentType = 'cricket';

                boot.init(window.GU.opts);
                
                const initMock = jest.spyOn(ads, 'init').mockImplementation(() => jest.fn())
                expect(initMock).toHaveBeenCalled();
                expect(initMock).toHaveBeenCalledWith({
                    adsConfig: 'xxx',
                    adsType: 'default',
                    mpuAfterParagraphs: 0
                });
            });

            it('initialises common if GU.opts.contentType is interactive', function () {
                window.GU.opts.contentType = 'interactive';

                boot.init(window.GU.opts);
                
                const initMock = jest.spyOn(ads, 'init').mockImplementation(() => jest.fn())
                expect(initMock).toHaveBeenCalled();
                expect(initMock).toHaveBeenCalledWith({
                    adsConfig: 'xxx',
                    adsType: 'default',
                    mpuAfterParagraphs: 0
                });
            });
        });
    });
});
