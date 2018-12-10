import { init } from 'modules/more-tags';

describe('ArticleTemplates/assets/js/modules/more-tags', function () {
    let container;
    const getTagsHTML = function (count) {
        let i;
        let html = '<div class="tags" id="tags"><span class="screen-readable">Tags:</span><ul class="inline-list tags__inline-list" id="tag-list">';

        for (i = 0; i < count; i++) {
            html += '<li class="inline-list__item tags__list-item"></li>';
        }

        html += '</ul></div>';

        return html;
    };

    beforeEach(() => {
        window.GU = {
            opts: {
                useAdsReady: 'true',
                platform: 'ios'
            }
        };

        container = document.createElement('div');
        container.id = 'container';
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe('init()', function () {
        it('does not add more button if 5 tags or less', function () {
            container.innerHTML = getTagsHTML(5);
            init();
            expect(container.querySelector('#more-tags-container')).toEqual(null);
        });

        it('adds more button if more than 5 tags', function () {
            let i;
            let inlineList;
            let inlineListItems;
            let moreTagsContainer;

            container.innerHTML = getTagsHTML(6);

            init();

            moreTagsContainer = container.querySelector('#more-tags-container');

            expect(moreTagsContainer).not.toEqual(null);

            inlineList = container.querySelector('.tags__inline-list');

            expect(inlineList.childNodes[5]).toEqual(moreTagsContainer);

            inlineListItems = container.querySelectorAll('.tags__list-item:not(.more-button)');

            for (i = 0; i < inlineListItems.length; i++) {
                if (i < 5) {
                    expect(inlineListItems[i].classList.contains('hide-tags')).toEqual(false);
                } else {
                    expect(inlineListItems[i].classList.contains('hide-tags')).toEqual(true);
                }
            }
        });

        it('show tags on click of more button', function () {
            let moreTagsContainer;
            let event = document.createEvent('HTMLEvents');
            let lastInlineListItem;

            container.innerHTML = getTagsHTML(6);

            init();

            moreTagsContainer = container.querySelector('#more-tags-container');

            moreTagsContainer.style.display = 'block';

            lastInlineListItem = container.querySelectorAll('.tags__list-item:not(.more-button)')[5];

            expect(lastInlineListItem.classList.contains('hide-tags')).toEqual(true);

            event.initEvent('click', true, true);
            moreTagsContainer.dispatchEvent(event);

            expect(moreTagsContainer.style.display).toEqual('none');
            expect(lastInlineListItem.classList.contains('hide-tags')).toEqual(false);
        });
    });
});
