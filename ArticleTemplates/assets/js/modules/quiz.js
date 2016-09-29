/*global window,define */
define([
    'smoothScroll',
    'modules/ads'
], function (
    smoothScroll,
    Ads
) {
    'use strict';

    var initialised = false,
        numAnswered,
        questionCount,
        isPersonalityQuiz,
        moveMPU,
        score,
        scoreMessages,
        personalityQuizBuckets;

    function init(quiz) {
        numAnswered = 0;
        questionCount = 0;
        isPersonalityQuiz = document.getElementsByClassName('quiz__buckets')[0];
        moveMPU = isAdBelowQuiz(quiz);
        
        if (isPersonalityQuiz) {
            quiz.classList.add('personality-quiz');
            setupPersonalityQuizBuckets();
            setupPersonalityQuizQuestions();
            removePersonalityQuizAnswers();
            buildResultsPanel(quiz);
        } else {
            quiz.classList.add('news-quiz');
            score = 0;
            scoreMessages = getScoreMessages();
            setupNewsQuizQuestions();
            removeNewsQuizAnswers();
            buildScoresPanel(quiz);
        }
    
        quiz.classList.add('loaded');
    }

    function setupNewsQuizQuestions() {
        var i,
            questionsAndAnswers = getQuestionsAndAnswers(),
            question,
            questions = document.getElementsByClassName('quiz__question'),
            questionObj;

        for (i = 0; i < questions.length; i++) {
            question = questions[i];
            questionObj = questionsAndAnswers[i+1];
            questionObj.elem = question;
            wrapQuestion(question);
            setupNewsQuizAnswers(questionObj);
            questionCount++;
        }
    }

    function setupNewsQuizAnswers(questionObj) {
        var i,
            answerCode,
            answers = questionObj.elem.getElementsByClassName('question__answer');
    
        for (i = 0; i < answers.length; i++) {
            answerCode = GU.util.getStringFromUnicodeVal(65 + i);
            if (answerCode === questionObj.correctAnswer) {
                if (questionObj.revealText) {
                    answers[i].dataset.correctAnswerExplanation = questionObj.revealText;
                }
                answers[i].dataset.correct = 'true';
            }
            styleAnswer(answers[i]);
            answers[i].addEventListener('click', onNewsAnswerClick.bind(null, answers[i], questionObj.elem, answers[i].getElementsByTagName('img')[0]));
        }                
    }

    function removeNewsQuizAnswers() {
        var i,
            answers = document.querySelectorAll('.quiz__correct-answers-title, .quiz__correct-answers');

        for (i = 0; i < answers.length; i++) {
            answers[i].parentNode.removeChild(answers[i]);
        }
    }

    function setupPersonalityQuizBuckets() {
        var i,
            bucketCode,
            buckets = document.getElementsByClassName('quiz__bucket'),
            quizBuckets = {};

        for (i = 0; i < buckets.length; i++) {
            bucketCode = GU.util.getStringFromUnicodeVal(65 + i);
            quizBuckets[bucketCode] = {
                count: 0,
                title: buckets[i].dataset.title,
                description: buckets[i].dataset.description
            };
        }

        personalityQuizBuckets = quizBuckets;
    }

    function setupPersonalityQuizQuestions() {
        var i,
            question,
            questions = document.getElementsByClassName('quiz__question'),
            questionObj;

        for (i = 0; i < questions.length; i++) {
            question = questions[i];
            questionObj = {};
            questionObj.elem = question;
            wrapQuestion(question);
            setupPersonalityQuizAnswers(questionObj);
            questionCount++;
        }
    }

    function setupPersonalityQuizAnswers(questionObj) {
        var i,
            answers = questionObj.elem.getElementsByClassName('question__answer');

        for (i = 0; i < answers.length; i++) {
            styleAnswer(answers[i]);

            answers[i].addEventListener('click', onPersonalityAnswerClick.bind(null, answers[i], questionObj.elem));
        }                
    }

    function removePersonalityQuizAnswers() {
        var i,
            answers = document.querySelectorAll('.quiz__buckets-title, .quiz__buckets');

        for (i = 0; i < answers.length; i++) {
            answers[i].parentNode.removeChild(answers[i]);
        }
    }

    function getQuestionsAndAnswers() {
        var i,
            key,
            answerMatch,
            question,
            answer,
            answers = {},
            correctAnswerWordList = document.getElementsByClassName('quiz__correct-answers')[0].innerHTML.split(' ');

        for (i = 0; i < correctAnswerWordList.length; i++) {
            // Check if word in this format: 1:A
            answerMatch = correctAnswerWordList[i].match(/(\d+):([A-Z])/g);

            if (answerMatch && answerMatch.length) {
                answer = answerMatch[0];
                question = answer.split(':')[0];
                answers[question] = {
                    correctAnswer: answer.split(':')[1]
                };
            } else {
                if (!answers[question].revealText || answers[question].revealText === '- ') {
                    answers[question].revealText = '';
                }
                answers[question].revealText += correctAnswerWordList[i] + ' ';
            }
        }

        for (key in answers) {
            if (answers.hasOwnProperty(key) && answers[key].revealText) {
                // Remove trailing comma in revealText
                answers[key].revealText = answers[key].revealText.replace(/,\s*$/, '');
            }
        }

        return answers;
    }

    function getScoreMessages() {
        var i,
            message,
            minScore,
            scoreElems = document.querySelectorAll('.quiz__scores > li'),
            messages = {};

        for (i = 0; i < scoreElems.length; i++) {
            message = scoreElems[i].dataset.title;
            minScore = scoreElems[i].dataset.minScore;
            messages[Math.max(minScore, 0)] = message;
        }

        return messages;
    }

    function buildScoresPanel(quiz) {
        var scoresPanel = document.createElement('div');

        scoresPanel.classList.add('quiz-scores');
        scoresPanel.id = 'quiz-scores';
        scoresPanel.innerHTML = '<p class="quiz-scores__score">' +
            '<span class="quiz-scores__correct"></span> / <span class="quiz-scores__questions">' +
            questionCount + '</span></p><p class="quiz-scores__message"></p>';

        quiz.appendChild(scoresPanel);
    }

    function buildResultsPanel(quiz) {
        var resultPanel = document.createElement('div');

        resultPanel.classList.add('quiz-results');
        resultPanel.id = 'quiz-results';
        resultPanel.innerHTML = '<h1 class="quiz-results__title"></h1><p class="quiz-results__description"></p>';

        quiz.appendChild(resultPanel);
    }

    function wrapQuestion(question) {
        var i,
            questionWrapper = document.createElement('div'),
            questionAnswerList = question.getElementsByClassName('question__answers'),
            questionImages = question.querySelectorAll(':scope > img'),
            questionText = question.getElementsByClassName('question__text');

        questionWrapper.classList.add('question__wrapper');

        question.insertBefore(questionWrapper, questionAnswerList[0]);

        // Does this question have text
        for (i = 0; i < questionText.length; i++) {
            adjustText(questionWrapper, questionText[i]);
        }

        // Does this question have an image
        for (i = 0; i < questionImages.length; i++) {
            adjustImage(question, questionWrapper, questionImages[i], true);
        }
    }

    function styleAnswer(answer) {
        var answerImages = answer.querySelectorAll(':scope > img'),
            answerMarker = document.createElement('div'),
            answerMessage = document.createElement('div'),
            answerWrapper = document.createElement('div'),
            answerText = answer.getElementsByClassName('answer__text'),
            i;

        // Wrap answer in a div for styling
        answerWrapper.classList.add('answer__wrapper');
        answer.appendChild(answerWrapper);

        // Add an answer message div to wrap text answer, correct/wrong message and explanation response
        answerMessage.classList.add('answer__message');
        answerWrapper.appendChild(answerMessage);

        // Add a marker icon span
        answerMarker.classList.add('answer__marker');
        if (isPersonalityQuiz) {
           answerMarker.innerHTML = '<div class="answer__marker__inner"></div>'; 
        }
        answerWrapper.appendChild(answerMarker);

        // Does this answer have text
        for (i = 0; i < answerText.length; i++) {
            adjustText(answerMessage, answerText[i]);
        }

        // Does this answer have an image
        for (i = 0; i < answerImages.length; i++) {
            adjustImage(answer, answerWrapper, answerImages[i], false);
        }
    }

    function adjustImage(parent, wrapper, image, isQuestion) {
        var src = image.getAttribute('src');

        if (src !== '') {
            parent.classList.add('has-image');
            if (isQuestion) {
                wrapper.parentNode.classList.add('question__img');
                // if the text height is greater than the image height resize the wrapper
                checkWrapperHeight(src, image, wrapper);
            } else {
                image.classList.add('answer__img');
            }
            wrapper.appendChild(image);
        } else {
            image.parentNode.removeChild(image);
        }
    }

    function checkWrapperHeight(src, image, wrapper) {
        var dummyImage,
            text = wrapper.getElementsByClassName('question__text')[0];

        if (!text) {
            return;
        }

        dummyImage = document.createElement('img');
        dummyImage.addEventListener('load', adjustWrapperHeight.bind(null, image, text, wrapper));
        dummyImage.src = src;
    }

    function adjustWrapperHeight(image, text, wrapper) {
        if (image.offsetHeight < text.offsetHeight) {
            wrapper.style.height = text.offsetHeight + 'px';
        }
    }

    function adjustText(parent, text) {
        parent.appendChild(text);
    }

    function isAdBelowQuiz(quiz) {
        var adBelowQuiz = false,
            mpu = document.getElementsByClassName('advert-slot__wrapper')[0],
            mpuOffset,
            quizOffset;

        if (mpu) {
            mpuOffset = GU.util.getElementOffset(mpu).top;
            quizOffset = GU.util.getElementOffset(quiz).top;

            if (mpuOffset > quizOffset) {
                adBelowQuiz = true;
            }
        }

        return adBelowQuiz;
    }

    function adjustAdPosition(yPos, startTime, timeStamp) {
        var newYPos,
            progress;

        if (!startTime) {
            startTime = timeStamp;
        }

        progress = timeStamp - startTime;
        newYPos = Ads.updateMPUPosition(yPos);

        if (progress < 2000) {
            window.requestAnimationFrame(adjustAdPosition.bind(null, newYPos, startTime));
        }
    }

    function onNewsAnswerClick(answer, question, isImage) {
        var answerPara,
            correctAnswerWrapper,
            startTime = null,
            yPos = null;

        if (question.classList.contains('answered')) {
            return;
        }

        if (answer.dataset.correct === 'true') {
            question.classList.add('is-correct');                    
            score++;
        } else {
            answer.classList.add('wrong-answer');
            question.classList.add('is-wrong');
            answer = question.querySelector('[data-correct="true"]');
        }

        answer.classList.add('correct-answer');

        if (answer.dataset.correctAnswerExplanation) {
            answerPara = document.createElement('p');
            answerPara.classList.add('answer__explanation');
            answerPara.innerHTML = answer.dataset.correctAnswerExplanation.trim();
            correctAnswerWrapper = answer.getElementsByClassName('answer__message')[0];
            correctAnswerWrapper.appendChild(answerPara);
        }

        question.classList.add('answered');
        numAnswered++;

        // If necessary set up a call to check mpu position
        if (moveMPU) {
            window.requestAnimationFrame(adjustAdPosition.bind(null, yPos, startTime));
        }

        // When we have an image answer we need to move the positioning of the explanation and marker 
        if (isImage) {
            showMarkedAnswer(question);
        }

        // If all questions have been answered display the score
        if (questionCount === numAnswered) {
            showScore();
        }
    }

    function onPersonalityAnswerClick(answer, question) {
        var hightedAnswer;

        if (question.classList.contains('answered')) {
            if (answer.classList.contains('highlight-answer') ||
                questionCount === numAnswered) {
                return;    
            } else {
                hightedAnswer = question.getElementsByClassName('highlight-answer')[0];
                hightedAnswer.classList.remove('highlight-answer');
                personalityQuizBuckets[hightedAnswer.dataset.buckets].count--;
                numAnswered--;
            }
        }

        if (personalityQuizBuckets[answer.dataset.buckets]) {
            question.classList.add('answered');
            answer.classList.add('highlight-answer');
            numAnswered++;
            personalityQuizBuckets[answer.dataset.buckets].count++;

            // If all questions have been answered display the score
            if (questionCount === numAnswered) {
                showResult();
            }
        }
    }

    function showMarkedAnswer(question) {
        var i,
            markedAnswer,
            markedAnswers = question.querySelectorAll('.correct-answer, .wrong-answer'),
            thisMessage,
            thisHeight,
            thisMarker;

        for (i = 0; i < markedAnswers.length; i++) {
            markedAnswer = markedAnswers[i];
            thisMessage = markedAnswer.getElementsByClassName('answer__message')[0];
            thisHeight = thisMessage.offsetHeight;
            thisMarker = markedAnswer.getElementsByClassName('answer__marker')[0];
            // position explanation to the bottom of wrapper
            thisMessage.style.top = 'calc(100% - ' + thisHeight + 'px)';
            thisMarker.style.top = 'calc(100% - ' + (thisHeight - 7) + 'px)';
        }
    }

    function showScore() {
        var i,
            scoreDisplayMessage = '';

        for (i = 0; i < score; i++) {
            if (scoreMessages[i]) {
                scoreDisplayMessage = scoreMessages[i];
            }
        }

        document.getElementsByClassName('quiz-scores__correct')[0].innerHTML = score.toString();
        document.getElementsByClassName('quiz-scores__message')[0].innerHTML = scoreDisplayMessage;
        document.getElementsByClassName('quiz-scores')[0].classList.add('open');

        // Scroll score panel into view
        smoothScroll.animateScroll('#quiz-scores', null, {speed: 1500, offset: 40});
    }

    function showResult() {
        var key,
            bucket,
            result,
            resultTitle,
            resultDescription;

        for (key in personalityQuizBuckets) {
            if (personalityQuizBuckets.hasOwnProperty(key)) {
                bucket = personalityQuizBuckets[key];
                if (!result || (bucket.count > result.count)) {
                    result = bucket;
                    resultDescription = result.description;
                    resultTitle = result.title;
                }
            }
        }

        document.getElementsByClassName('quiz-results__description')[0].innerHTML = resultDescription;
        document.getElementsByClassName('quiz-results__title')[0].innerHTML = resultTitle;
        document.getElementsByClassName('quiz-results')[0].classList.add('open');

        // Scroll result panel into view
        smoothScroll.animateScroll('#quiz-results', null, {speed: 1500, offset: 40});
    }

    function ready() {
        var quiz;

        if (!initialised) {
            initialised = true;
            
            quiz = document.querySelector('.element-atom .quiz');
            
            if (quiz) {
                init(quiz);
            }
        }
    }

    return {
        init: ready
    };

});