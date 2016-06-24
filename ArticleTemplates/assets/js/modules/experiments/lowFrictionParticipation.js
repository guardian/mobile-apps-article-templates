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

    var touchMove;

    var interactionTracked;

    var isValid;

    function init(variant) {
        if (variant) {
            isValid = isValidArticleType() && hasCommentsEnabled();

            if (variant === 'control') {
                kickOffControlTest();
            } else {
                kickOffVariantTest();
            }
        }
    }

    function kickOffVariantTest() {
        if (isValid) {
            els.lowFricContainer = document.createElement('div');
            els.lowFricContainer.classList.add('participation-low-fric');
            els.articleBody = document.getElementsByClassName('article__body > .prose')[0];

            getUserVote(setUpParticipation);
        }
    }

    function kickOffControlTest() {
        // if in a film review or on a comments page
        // check local storage to see if user has voted on this article before
        if (isValid || (GU.opts.contentType === 'comments' && GU.opts.sectionTone === 'review')) {
            getUserVote(hasUserSeenControlTest);
        }
    }

    function hasUserSeenControlTest(data) {
        var data = data || {};
        var currentPage = GU.opts.pageId.replace(/\//g, '_');

        if (typeof data === 'string') {
            data = JSON.parse(data);
        }

        if (isValid) {
            // if in a film review track test
            GU.util.signalDevice('trackAction/lowFrictionParticipationControlView');
            // if we haven't stored the test in storage before do so now
            if (!data[currentPage]) {
                data[currentPage] = null;
                GU.util.signalDevice('setTemplateStorage/' + storageKey + '/' + JSON.stringify(data));
            }
        } else if (typeof data[currentPage] === 'undefined') {
            // do nothing if on comments and we've never seen test on corresponding article
            return;
        }

        // bind control test events
        // for now stick 1000ms delay to give comments time to load
        setTimeout(bindControlEvents, 1000);
    }

    function bindControlEvents() {
        var i;
        var commentElems = document.querySelectorAll('.comments__post, .comment__reply');

        for (i = 0; i < commentElems.length; i++) {
            commentElems[i].addEventListener('click', trackCommentInteraction);
        }
    }

    function trackCommentInteraction() {
        if (!interactionTracked) {
            GU.util.signalDevice('trackAction/lowFrictionParticipationControlAction');
            interactionTracked = true;
        }
    }

    function isValidArticleType() {
        return GU.opts.contentType === 'article' && GU.opts.sectionTone === 'review' && GU.opts.section === 'film';
    }

    function hasCommentsEnabled() {
        return document.getElementsByClassName('comment-count')[0];
    }

    function getUserVote(callback) {
        window.retrieveLowFrictionParticipationData = callback;
        GU.util.signalDevice('getTemplateStorage/' + storageKey + '/retrieveLowFrictionParticipationData');
    }

    function updateState(state) {
        render(GU.util.merge(currentState, state));
    }

    function render(state) {
        var reviewRating;

        if (state.initialRender) {
            els.lowFricContainer.innerHTML = 
                '<h2 class="participation-low-fric__title">' + settings.templateVars.title + '</h2>' +
                '<p class="participation-low-fric__desc">' + settings.templateVars.description + '</p>' +
                '<div class="participation-low-friction__contents"><p class="review-rating"></p></div>';

            reviewRating = els.lowFricContainer.getElementsByClassName('review-rating')[0];

            reviewRating.innerHTML = createButtonsHTML();

            els.articleBody.appendChild(els.lowFricContainer);
        } else {
            reviewRating = els.lowFricContainer.getElementsByClassName('review-rating')[0];
            clearRating(reviewRating);
        }

        if (state.selectedItem) {
            reviewRating.classList.add(state.selectedItem);
        }
    }

    function createButtonsHTML() {
        var i;
        var html = '';

        for (i = 0; i < settings.itemCount; i++) {
            html += '<span data-icon="&#xe036;" aria-hidden="true" class="participation-low-fric--button"></span>';
        }

        return html;
    }

    function clearRating(reviewRating) {
        var className;
        var i;

        for (i = reviewRating.classList.length; i > 0; i--) {
            className = reviewRating.classList[i - 1];

            if (className.indexOf('review-rating--') !== -1) {
                reviewRating.classList.remove(className);
                break;
            }
        }
    }

    function bindEvents() {
        var i
        var rating;
        var handleTouchMoveDebounced = GU.util.debounce(handleTouchMove, 10);
        var touchArea = els.lowFricContainer.getElementsByClassName('participation-low-friction__contents')[0];
        var buttons = els.lowFricContainer.getElementsByClassName('participation-low-fric--button');

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

        // steal swipe from android
        if (window.GuardianJSInterface && 
            window.GuardianJSInterface.registerRelatedCardsTouch) {
            window.GuardianJSInterface.registerRelatedCardsTouch(true);
        }
    }

    function onTouchMove(handleTouchMoveDebounced, evt) {
        // touchStart true when touchMove began on touchArea
        if (touchStart) {
            evt.preventDefault();
            handleTouchMoveDebounced(evt);
            touchMove = true;
        }
    }

    function onTouchEnd() {
        if (touchStart && touchMove) {
            submitRating();
        }

        touchStart = null;
        touchMove = null;

        // return swipe to android
        if (window.GuardianJSInterface && 
            window.GuardianJSInterface.registerRelatedCardsTouch) {
            window.GuardianJSInterface.registerRelatedCardsTouch(false);
        }
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
        getUserVote(saveRating);
    }

    function saveRating(data) {
        var data = data || {};
        var currentPage = GU.opts.pageId.replace(/\//g, '_');

        if (typeof data === 'string') {
            data = JSON.parse(data);
        }

        data[currentPage] = currentState.selectedItem;

        GU.util.signalDevice('setTemplateStorage/' + storageKey + '/' + JSON.stringify(data));

        if (!interactionTracked) {
             GU.util.signalDevice('trackAction/lowFrictionParticipationVariantAction');
             interactionTracked = true;
        }

        addTestMessage();
    } 

    function addTestMessage() {
        var testMessage = els.lowFricContainer.getElementsByClassName('participation-low-friction__test-message')[0];

        if (!testMessage) {
            testMessage = document.createElement('DIV');
            testMessage.classList.add('participation-low-friction__test-message');
            testMessage.innerHTML = settings.templateVars.testMessage;
            els.lowFricContainer.appendChild(testMessage);
            setTimeout(showTestMessage.bind(null, testMessage), 250);
        }
    }

    function showTestMessage(testMessage) {
        testMessage.classList.add('show-message');
    }

    function setUpParticipation(data) {
        var userVote = null;
        var currentPage = GU.opts.pageId.replace(/\//g, '_');

        if (data) {
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            if (data[currentPage]) {
                userVote = data[currentPage]
            }
        }
        
        updateState({
            selectedItem: userVote
        });

        bindEvents();

        GU.util.signalDevice('trackAction/lowFrictionParticipationVariantView');
    }

    return {
        init: init
    };
});