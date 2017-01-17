define(function () {
    'use strict';

    var SHOW_TAGS = 5;
    var initialised;
    var moreButton;
    var hiddenTags;

    function init() {
        var firstHiddenTag,
            tags;

        if (!initialised) {
            initialised = true;
            tags = document.querySelectorAll('.tags .inline-list .inline-list__item');

            if (tags.length > SHOW_TAGS + 1) {
                moreButton = document.createElement('li');
                moreButton.id = 'more-tags-container';
                moreButton.classList.add('inline-list__item');
                moreButton.classList.add('more-button');
                moreButton.classList.add('js-more-button');
                moreButton.innerHTML = '<a id="more">More...</a>';

                moreButton.addEventListener('click', show);

                firstHiddenTag = tags[SHOW_TAGS + 1];

                firstHiddenTag.parentNode.insertBefore(moreButton, firstHiddenTag);

                hiddenTags = document.querySelectorAll('#more-tags-container ~ .inline-list__item');
            
                hideTags();
            }
        }
    }

    function show() {
        var i;

        moreButton.style.display = 'none';

        for (i = 0; i < hiddenTags.length; i++) {
            hiddenTags[i].classList.remove('hide-tags');   
        }

        setTimeout(showTags, 200);
    }

    function hideTags() {
        var i;

        for (i = 0; i < hiddenTags.length; i++) {
            hiddenTags[i].classList.add('hide-tags');   
        }
    }

    function showTags() {
        var i;

        for (i = 0; i < hiddenTags.length; i++) {
            hiddenTags[i].classList.remove('hide-tags');   
        }
    }

    return {
        init: init
    };
});