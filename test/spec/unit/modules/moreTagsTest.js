define([
    'squire'
], function (
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/modules/more-tags', function () {
        var clock,
            moreTags,
            container,
            getTagsHTML = function (count) {
                var i,
                    html = '<div class="tags" id="tags"><span class="screen-readable">Tags:</span><ul class="inline-list tags__inline-list" id="tag-list">';

                for (i = 0; i < count; i++) {
                    html += '<li class="inline-list__item tags__list-item"></li>';
                }

                html += '</ul></div>';

                return html;
            };

        beforeEach(function (done) {
            var injector = new Squire();

            clock = sinon.useFakeTimers();

            container = document.createElement('div');
            container.id = 'container';
            document.body.appendChild(container);

            injector
                .require(['ArticleTemplates/assets/js/modules/more-tags'], function (sut) {
                    moreTags = sut;
                    done();
                });
        });

        afterEach(function () {
            document.body.removeChild(container);
            clock.restore();
        });

        describe('init()', function () {
            it('does not add more button if 5 tags or less', function () {
                container.innerHTML = getTagsHTML(5);

                moreTags.init();

                expect(container.querySelector('#more-tags-container')).to.eql(null);
            });

            it('adds more button if more than 5 tags', function () {
                var i,
                    inlineList,
                    inlineListItems,
                    moreTagsContainer;

                container.innerHTML = getTagsHTML(6);

                moreTags.init();

                moreTagsContainer = container.querySelector('#more-tags-container');

                expect(moreTagsContainer).to.not.eql(null);

                inlineList = container.querySelector('.tags__inline-list');

                expect(inlineList.childNodes[5]).to.eql(moreTagsContainer);

                inlineListItems = container.querySelectorAll('.tags__list-item:not(.more-button)');

                for (i = 0; i < inlineListItems.length; i++) {
                    if (i < 5) {
                        expect(inlineListItems[i].classList.contains('hide-tags')).to.eql(false);
                    } else {
                        expect(inlineListItems[i].classList.contains('hide-tags')).to.eql(true);
                    }
                }
            });

            it('show tags on click of more button', function () {
                var moreTagsContainer,
                    event = document.createEvent('HTMLEvents'),
                    lastInlineListItem;

                container.innerHTML = getTagsHTML(6);

                moreTags.init();

                moreTagsContainer = container.querySelector('#more-tags-container');

                moreTagsContainer.style.display = 'block';

                lastInlineListItem = container.querySelectorAll('.tags__list-item:not(.more-button)')[5];

                expect(lastInlineListItem.classList.contains('hide-tags')).to.eql(true);

                event.initEvent('click', true, true);
                moreTagsContainer.dispatchEvent(event);

                clock.tick(200);

                expect(moreTagsContainer.style.display).to.eql('none');
                expect(lastInlineListItem.classList.contains('hide-tags')).to.eql(false);
            });
        });
    });
});
