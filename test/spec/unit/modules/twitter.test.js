import { init } from 'modules/twitter';
import * as util from 'modules/util';

describe('ArticleTemplates/assets/js/modules/twitter', function () {
    let container;

    beforeEach(function () {
        container = document.createElement('div');
        container.id = 'container';
        document.body.appendChild(container);

        window.GU = {
            opts: {
                isMinute: false
            }
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

        it('adds twitter script if not the minute and js-tweet tweet on page', function () {
            container.innerHTML = '<blockquote class="js-tweet"></blockquote>';

            init();

            expect(document.querySelectorAll('#twitter-widget').length).toEqual(1);
        });

        it('adds twitter script if not the minute and twitter-tweet tweet on page', function () {
            container.innerHTML = '<blockquote class="twitter-tweet"></blockquote>';

            init();

            expect(document.querySelectorAll('#twitter-widget').length).toEqual(1);
        });

        it('add scroll event listener to enhances tweets on scroll', function () {
            var blockquote = document.createElement('blockquote');

            blockquote.classList.add('twitter-tweet');

            container.appendChild(blockquote);

            window.twttr = {
                events: {
                    bind: jest.fn()
                },
                widgets: {
                    load: jest.fn()
                }
            };

            // intercept appendChild and force load event on script
            jest.spyOn(document.body, 'appendChild').mockImplementation((script) => {
                if (script.tagName.toLowerCase() === 'script') {
                    script.onload();
                }
            });

            jest.spyOn(window, 'addEventListener').mockImplementation(() => jest.fn());

            init();

            expect(window.addEventListener).toHaveBeenCalledTimes(1);
            expect(window.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
            expect(util.debounce).toHaveBeenCalledTimes(1);
        });
    });
});
