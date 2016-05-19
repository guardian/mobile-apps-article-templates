define(function() {
    'use strict';

    var prefs = 'gu.lowFricParticipation';

    var currentState = {
        initialRender: true,
        selectedItem: null
    };

    var settings = {
        itemCount: 5,
        templateVars: {
            title: 'Do you agree? Rate this film now',
            description: 'Let us know what you think!',
            testMessage: 'This is a test. We\'re currently evaluating this as a potential new feature'
        }
    };

    var els = {};

    var buttonPositions = [];

    var touchStart;

    var module = {
        init: function(options) {
            var lowFricContainer,
                userVote = module.getUserVote() || null;

            // If we can't store the user's value, don't render
            if (userVote === 'no-storage') {
                return;
            }

            // Create instance options
            settings = GU.util.merge(settings, options);

            els.lowFricContainer = document.createElement('div');
            els.lowFricContainer.classList.add('participation-low-fric');
            els.articleBody = document.querySelector('.article__body > .prose');

            module.updateState({
                selectedItem: userVote
            });
  
            module.bindEvents();
        },

        getUserVote: function () {
            if (!window.localStorage) {
                return 'no-storage';
            }

            var currentPage = GU.opts.pageId,
                votedPages = JSON.parse(GU.util.getLocalStorage(prefs));

            // Will return result for current page if available
            return votedPages && votedPages[currentPage];
        },

        updateState: function (state) {
            // Render with merged state
            module.render(GU.util.merge(currentState, state));
        },

        render: function (state) {
            var reviewRating;

            if (state.initialRender) {
                els.lowFricContainer.innerHTML = 
                    '<h2 class="participation-low-fric__title">' + settings.templateVars.title + '</h2>' +
                    '<p class="participation-low-fric__desc">' + settings.templateVars.description + '</p>' +
                    '<div class="participation-low-friction__contents">' +
                    '<p class="review-rating"></p></div>';

                reviewRating = els.lowFricContainer.querySelector('.review-rating')

                module.createButtons(reviewRating);

                els.articleBody.appendChild(els.lowFricContainer);
            } else {
                reviewRating = els.lowFricContainer.querySelector('.review-rating')
            }

            module.clearRating(reviewRating);

            if (state.selectedItem) {
                reviewRating.classList.add(state.selectedItem);
            }
        },

        createButtons: function (reviewRating) {
            var i,
                html = '';

            for (i = 0; i < settings.itemCount; i++) {
                html += '<span data-icon="&#xe036;" aria-hidden="true" class="participation-low-fric--button"></span>';
            }

            reviewRating.innerHTML = html;
        },

        clearRating: function (reviewRating) {
            var className, 
                i;

            for (i = reviewRating.classList.length; i > 0; i--) {
                className = reviewRating.classList[i - 1];

                if (className.indexOf('review-rating--') !== -1) {
                    reviewRating.classList.remove(className);
                }
            }
        },

        bindEvents: function () {
            var i,
                rating,
                touchArea = els.lowFricContainer.querySelector('.participation-low-friction__contents'),
                buttons = els.lowFricContainer.querySelectorAll('.participation-low-fric--button');

            for (i = 0; i < buttons.length; i++) {
                rating = 'review-rating--' + (i + 1);
                buttons[i].addEventListener('click', module.onButtonClick.bind(null, rating));
                buttonPositions.push(buttons[i].offsetLeft);
            }

            touchArea.addEventListener('touchmove',  GU.util.debounce(module.onTouchMove, 10));
            touchArea.addEventListener('touchend',  GU.util.debounce(module.onTouchEnd, 10));
        },

        onButtonClick: function (rating) {
            module.updateState({
                initialRender: false,
                selectedItem: rating
            });

            module.submitRating();
        },

        onTouchMove: function (evt) {
            var i,
                rating,
                lastButtonPosition = buttonPositions[buttonPositions.length - 1],
                touchPos = evt.targetTouches[0].pageX;

            if (!touchStart) {
                touchStart = touchPos;
            }

            if (touchStart > lastButtonPosition &&
                touchPos > lastButtonPosition) {
                return;
            }

            for (i = 0; i < buttonPositions.length; i++) {
                if (touchPos > buttonPositions[i]) {
                    rating = 'review-rating--' + (i + 1);
                }
            }

            if (rating) {
                module.updateState({
                    initialRender: false,
                    selectedItem: rating
                });
            } else {
                module.updateState({
                    initialRender: false,
                    selectedItem: null
                });
            }
        },

        onTouchEnd: function () {
            if (touchStart) {
                module.submitRating();
            }

            touchStart = null;
        },

        submitRating: function () {
            var currentPage = GU.opts.pageId,
                votedPages = JSON.parse(GU.util.getLocalStorage(prefs));

            // If the prefs object doesn't exist, lets create one
            if (!votedPages) {
                votedPages = {};
            }

            votedPages[currentPage] = currentState.selectedItem;

            GU.util.setLocalStorage(prefs, JSON.stringify(votedPages));
        }
    };

    return module;
});