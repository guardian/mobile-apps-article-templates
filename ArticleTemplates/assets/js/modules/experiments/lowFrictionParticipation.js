define(function() {
    'use strict';

    var storageKey = 'lowFrictionParticipation';

    var currentState = {
        initialRender: true,
        selectedItem: null
    };

    var settings = {
        itemCount: 5,
        templateVars: {
            title: 'Do you agree? Rate this film now',
            description: 'Let us know what you think!',
            testMessage: 'Thanks for voting. This is a test. We\'re currently evaluating this as a potential new feature.'
        }
    };

    var els = {};

    var buttonPositions = [];

    var touchStart;

    function init(options) {
        if (isValid()) {
            settings = GU.util.merge(settings, options);

            els.lowFricContainer = document.createElement('div');
            els.lowFricContainer.classList.add('participation-low-fric');
            els.articleBody = document.querySelector('.article__body > .prose');

            window.retrieveLowFrictionParticipationData = retrieveLowFrictionParticipationData.bind(null, setUpParticipation);

            getUserVote();
        }
    }

    function isValid() {
        return isValidArticleType() && isValidAuthor() && hasCommentsEnabled();
    }

    function isValidArticleType() {
        return GU.opts.contentType === 'article' && GU.opts.sectionTone === 'review' && GU.opts.section === 'music';
    }

    function isValidAuthor() {
        var i,
            authorList = ['profile/alexispetridis','profile/kittyempire'],
            byline = document.querySelector('.byline__author');

        for (i = 0; i < authorList.length; i++) {
            if (byline && byline.innerHTML && (byline.innerHTML.indexOf(authorList[i]) !== -1)) {
                return true;
            }
        }

        return false;
    }

    function hasCommentsEnabled() {
        return document.querySelector('.comment-count');
    }

    function getUserVote() {
        GU.util.signalDevice('getTemplateStorage/' + storageKey + '/retrieveLowFrictionParticipationData');
    }

    function updateState(state) {
        // Render with merged state
        render(GU.util.merge(currentState, state));
    }

    function render(state) {
        var reviewRating;

        if (state.initialRender) {
            els.lowFricContainer.innerHTML = 
                '<h2 class="participation-low-fric__title">' + settings.templateVars.title + '</h2>' +
                '<p class="participation-low-fric__desc">' + settings.templateVars.description + '</p>' +
                '<div class="participation-low-friction__contents"><p class="review-rating"></p></div>';

            reviewRating = els.lowFricContainer.querySelector('.review-rating')

            createButtons(reviewRating);

            els.articleBody.appendChild(els.lowFricContainer);
        } else {
            reviewRating = els.lowFricContainer.querySelector('.review-rating')
        }

        clearRating(reviewRating);

        if (state.selectedItem) {
            reviewRating.classList.add(state.selectedItem);
        }
    }

    function createButtons(reviewRating) {
        var i;
        var html = '';

        for (i = 0; i < settings.itemCount; i++) {
            html += '<span data-icon="&#xe036;" aria-hidden="true" class="participation-low-fric--button"></span>';
        }

        reviewRating.innerHTML = html;
    }

    function clearRating(reviewRating) {
        var className;
        var i;

        for (i = reviewRating.classList.length; i > 0; i--) {
            className = reviewRating.classList[i - 1];

            if (className.indexOf('review-rating--') !== -1) {
                reviewRating.classList.remove(className);
            }
        }
    }

    function bindEvents() {
        var i
        var rating;
        var handleTouchMoveDebounced = GU.util.debounce(handleTouchMove, 10);
        var touchArea = els.lowFricContainer.querySelector('.participation-low-friction__contents');
        var buttons = els.lowFricContainer.querySelectorAll('.participation-low-fric--button');

        for (i = 0; i < buttons.length; i++) {
            rating = 'review-rating--' + (i + 1);
            buttons[i].addEventListener('click', onButtonClick.bind(null, rating));
            buttonPositions.push(buttons[i].offsetLeft);
        }

        window.addEventListener('touchmove', onTouchMove.bind(null, handleTouchMoveDebounced));
        
        touchArea.addEventListener('touchstart', onTouchStart);
        touchArea.addEventListener('touchend', onTouchEnd);
    }

    function onButtonClick(rating) {
        updateState({
            initialRender: false,
            selectedItem: rating
        });

        submitRating();
    }

    function onTouchStart(evt) {
        var touchPos = evt.targetTouches[0].pageX;

        touchStart = touchPos;
    }

    function onTouchMove(handleTouchMoveDebounced, evt) {
        if (touchStart) {
            evt.preventDefault();
            handleTouchMoveDebounced(evt);
        }
    }

    function onTouchEnd() {
        if (touchStart) {
            submitRating();
        }

        touchStart = null;
    }

    function handleTouchMove(evt) {
        var lastButtonPosition = buttonPositions[buttonPositions.length - 1];
        var touchPos = evt.targetTouches[0].pageX;

        if (!touchStart) {
            touchStart = touchPos;
        }

        if (touchStart > lastButtonPosition &&
            touchPos > lastButtonPosition) {
            return;
        }

        setRatingOnTouchMove(touchPos);
    }

    function setRatingOnTouchMove(touchPos) {
        var i;
        var rating;

        for (i = 0; i < buttonPositions.length; i++) {
            if (touchPos > buttonPositions[i]) {
                rating = 'review-rating--' + (i + 1);
            }
        }

        updateState({
            initialRender: false,
            selectedItem: rating || null
        });
    }

    function submitRating() {
        window.retrieveLowFrictionParticipationData = retrieveLowFrictionParticipationData.bind(null, saveRating);

        getUserVote();
    }

    function saveRating(data) {
        var currentPage = GU.opts.pageId;

        if (!data) {
            data = {};
        }

        data[currentPage] = currentState.selectedItem;

        GU.util.signalDevice('setTemplateStorage/' + storageKey + '/' + JSON.stringify(data));

        addTestMessage();
    } 

    function addTestMessage() {
        var testMessage = els.lowFricContainer.querySelector('.participation-low-friction__test-message');

        if (!testMessage) {
            testMessage = document.createElement('DIV');
            testMessage.classList.add('participation-low-friction__test-message');
            testMessage.innerHTML = settings.templateVars.testMessage;
            els.lowFricContainer.appendChild(testMessage);
            setTimeout(showTestMessage.bind(null, testMessage), 250);
        }
    }

    function showTestMessage(testMessage) {
        testMessage.classList.add('show-message')
    } 

    function retrieveLowFrictionParticipationData(data, callback) {
        var parsedData = JSON.parse(data);

        callback(parsedData);
    },

    function setUpParticipation(data) {
        var userVote = null;
        var currentPage = GU.opts.pageId;

        if (data && data[currentPage]) {
            userVote = data[currentPage]
        }
        
        updateState({
            selectedItem: userVote
        });

        bindEvents();
    }

    return {
        init: init
    };
});