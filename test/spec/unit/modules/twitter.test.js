import { init } from 'modules/twitter';
import * as util from 'modules/util';

describe('ArticleTemplates/assets/js/modules/twitter', function () {
    let container;

    beforeEach(function () {
        container = document.createElement('div');
        container.id = 'container';
        document.body.appendChild(container);

        window.GU = {
            opts: {}
        };

        jest.spyOn(util, 'debounce').mockImplementation(() => jest.fn());
    });

    afterEach(function () {
        var twitterScript = document.getElementById('twitter-widget');

        if (twitterScript) {
            twitterScript.parentNode.removeChild(twitterScript);
        }

        document.body.removeChild(container);

        delete window.GU;

        delete window.twttr;

        jest.resetAllMocks();
    });

    describe('init()', function () {
        it('does not add twitter script if no tweet on page', function () {
            init();

            expect(document.querySelectorAll('#twitter-widget').length).toEqual(0);
        });
    });
});
