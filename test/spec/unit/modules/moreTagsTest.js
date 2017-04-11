define([
    'squire'
], function (
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/modules/more-tags', function () {
        var moreTags,
            container,
            getTagsHTML = function(count) {
                var i,
                    html = '<div class="tags" id="tags"><ul class="inline-list" id="tag-list"><li class="inline-list__item screen-readable">Tags:</li>';

                for (i = 0; i < count; i++) {
                    html += '<li class="inline-list__item"></li>';
                }

                html += '</ul></div>';

                return html;
            };

        beforeEach(function (done) {
            var injector = new Squire();

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

                inlineList = container.querySelector('.inline-list');

                expect(inlineList.childNodes[6]).to.eql(moreTagsContainer);

                inlineListItems = container.querySelectorAll('.inline-list__item:not(.screen-readable):not(.more-button)');

                for (i = 0; i < inlineListItems.length; i++) {
                    if (i < 5) {
                        expect(inlineListItems[i].classList.contains('hide-tags')).to.eql(false);
                    } else {
                        expect(inlineListItems[i].classList.contains('hide-tags')).to.eql(true);
                    }
                }
            });

            it('show tags on click of more button', function (done) {
                var moreTagsContainer,
                    event = document.createEvent('HTMLEvents'),
                    lastInlineListItem;

                container.innerHTML = getTagsHTML(6);

                moreTags.init();

                moreTagsContainer = container.querySelector('#more-tags-container');

                moreTagsContainer.style.display = 'block';

                lastInlineListItem = container.querySelectorAll('.inline-list__item:not(.screen-readable):not(.more-button)')[5];

                expect(lastInlineListItem.classList.contains('hide-tags')).to.eql(true);

                event.initEvent('click', true, true);
                moreTagsContainer.dispatchEvent(event);

                setTimeout(function() {
                    expect(moreTagsContainer.style.display).to.eql('none');
                    expect(lastInlineListItem.classList.contains('hide-tags')).to.eql(false);

                    done();
                }, 250);
            });
        });
    });
});