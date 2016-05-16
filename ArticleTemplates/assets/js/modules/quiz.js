/*global window,console,define */
define([
    'smoothScroll',
    'modules/ads'
], function (
    smoothScroll,
    Ads
) {
    'use strict';

    var modules = {
            init: function (quiz) {
                modules.numAnswered = 0;
                modules.questionCount = 0;
                modules.isPersonalityQuiz = document.querySelector('.quiz__buckets');
                modules.moveMPU = modules.IsAdBelowQuiz(quiz);
                
                if (modules.isPersonalityQuiz) {
                    quiz.classList.add('personality-quiz');
                    modules.setupPersonalityQuizBuckets();
                    modules.setupPersonalityQuizQuestions();
                    modules.removePersonalityQuizAnswers();
                    modules.buildResultsPanel(quiz);
                } else {
                    quiz.classList.add('news-quiz');
                    modules.score = 0;
                    modules.scoreMessages = modules.getScoreMessages();
                    modules.setupNewsQuizQuestions();
                    modules.removeNewsQuizAnswers();
                    modules.buildScoresPanel(quiz);
                }
            
                quiz.classList.add('loaded');
            },

            setupNewsQuizQuestions: function () {
                var i,
                    correctAnswers = modules.getCorrectAnswers(),
                    question,
                    questions = document.querySelectorAll('.quiz__question'),
                    questionObj;

                for (i = 0; i < questions.length; i++) {
                    question = questions[i];
                    questionObj = {};
                    questionObj.elem = question;
                    modules.wrapQuestion(question);
                    questionObj.correctAnswer = correctAnswers[i];
                    modules.setupNewsQuizAnswers(questionObj);
                    modules.questionCount++;
                }
            },

            setupNewsQuizAnswers: function (questionObj) {
                var i,
                    answerCode,
                    answers = questionObj.elem.querySelectorAll('.question__answer');

                for (i = 0; i < answers.length; i++) {
                    answerCode = GU.util.getStringFromUnicodeVal(65 + i);
                    if (answerCode === questionObj.correctAnswer.code) {
                        answers[i].dataset.correctAnswerExplanation = questionObj.correctAnswer.explanation;
                        answers[i].dataset.correct = 'true';
                    }

                    modules.styleAnswer(answers[i]);

                    answers[i].addEventListener('click', modules.onNewsAnswerClick.bind(null, answers[i], questionObj.elem, answers[i].querySelector('img')));
                }                
            },

            removeNewsQuizAnswers: function () {
                var i,
                    answers = document.querySelectorAll('.quiz__correct-answers-title, .quiz__correct-answers');

                for (i = 0; i < answers.length; i++) {
                    answers[i].parentNode.removeChild(answers[i]);
                }
            },

            setupPersonalityQuizBuckets: function () {
                var i,
                    bucketCode,
                    buckets = document.querySelectorAll('.quiz__bucket'),
                    quizBuckets = {};

                for (i = 0; i < buckets.length; i++) {
                    bucketCode = GU.util.getStringFromUnicodeVal(65 + i);
                    quizBuckets[bucketCode] = {
                        count: 0,
                        title: buckets[i].dataset.title,
                        description: buckets[i].dataset.description
                    };
                }

                modules.quizBuckets = quizBuckets;
            },

            setupPersonalityQuizQuestions: function () {
                var i,
                    question,
                    questions = document.querySelectorAll('.quiz__question'),
                    questionObj;

                for (i = 0; i < questions.length; i++) {
                    question = questions[i];
                    questionObj = {};
                    questionObj.elem = question;
                    modules.wrapQuestion(question);
                    modules.setupPersonalityQuizAnswers(questionObj);
                    modules.questionCount++;
                }
            },

            setupPersonalityQuizAnswers: function (questionObj) {
                var i,
                    answers = questionObj.elem.querySelectorAll('.question__answer');

                for (i = 0; i < answers.length; i++) {
                    modules.styleAnswer(answers[i]);

                    answers[i].addEventListener('click', modules.onPersonalityAnswerClick.bind(null, answers[i], questionObj.elem));
                }                
            },

            removePersonalityQuizAnswers: function () {
                var i,
                    answers = document.querySelectorAll('.quiz__buckets-title, .quiz__buckets');

                for (i = 0; i < answers.length; i++) {
                    answers[i].parentNode.removeChild(answers[i]);
                }
            },

            getCorrectAnswers: function () {
                var i,
                    answers = [],
                    correctAnswers = document.querySelector('.quiz__correct-answers').innerHTML.split(','),
                    correctAnswerArray,
                    correctAnswerObj;
                
                for (i = 0; i < correctAnswers.length; i++) {
                    correctAnswerObj = {};
                    correctAnswerArray = correctAnswers[i].split(':')[1].split('-');
                    correctAnswerObj.code = correctAnswerArray[0].trim().toUpperCase();
                    correctAnswerObj.explanation = correctAnswerArray[1] || '';
                    answers.push(correctAnswerObj);
                } 

                return answers;
            },

            getScoreMessages: function () {
                var i,
                    message,
                    minScore,
                    scoreElems = document.querySelectorAll('.quiz__scores > li'),
                    scoreMessages = {};

                for (i = 0; i < scoreElems.length; i++) {
                    message = scoreElems[i].dataset.title;
                    minScore = scoreElems[i].dataset.minScore;
                    scoreMessages[Math.max(minScore, 0)] = message;
                }

                return scoreMessages;
            },

            buildScoresPanel: function (quiz) {
                var scoresPanel = document.createElement('div');

                scoresPanel.classList.add('quiz-scores');
                scoresPanel.id = 'quiz-scores';
                scoresPanel.innerHTML = '<p class="quiz-scores__score">' +
                    '<span class="quiz-scores__correct"></span> / <span class="quiz-scores__questions">' +
                    modules.questionCount + '</span></p><p class="quiz-scores__message"></p>';

                quiz.appendChild(scoresPanel);
            },

            buildResultsPanel: function (quiz) {
                var resultPanel = document.createElement('div');

                resultPanel.classList.add('quiz-results');
                resultPanel.id = 'quiz-results';
                resultPanel.innerHTML = '<h1 class="quiz-results__title"></h1><p class="quiz-results__description"></p>';

                quiz.appendChild(resultPanel);
            },

            wrapQuestion: function (question) {
                var i,
                    questionWrapper = document.createElement('div'),
                    questionAnswerList = question.querySelectorAll('.question__answers'),
                    questionImages = question.querySelectorAll(':scope > img'),
                    questionText = question.querySelectorAll('.question__text');

                questionWrapper.classList.add('question__wrapper');

                question.insertBefore(questionWrapper, questionAnswerList[0]);

                // Does this answer have an image
                for (i = 0; i < questionImages.length; i++) {
                    modules.adjustImage(question, questionWrapper, questionImages[i], true);
                }

                // Does this question have text
                for (i = 0; i < questionText.length; i++) {
                    modules.adjustText(questionWrapper, questionText[i]);
                }
            },

            styleAnswer: function (answer) {
                var answerImages = answer.querySelectorAll(':scope > img'),
                    answerMarker = document.createElement('div'),
                    answerMessage = document.createElement('div'),
                    answerWrapper = document.createElement('div'),
                    answerText = answer.querySelectorAll('.answer__text'),
                    i;

                // Wrap answer in a div for styling
                answerWrapper.classList.add('answer__wrapper');
                answer.appendChild(answerWrapper);

                // Add an answer message div to wrap text answer, correct/wrong message and explanation response
                answerMessage.classList.add('answer__message');
                answerWrapper.appendChild(answerMessage);

                // Add a marker icon span
                answerMarker.classList.add('answer__marker');
                if (modules.isPersonalityQuiz) {
                   answerMarker.innerHTML = '<div class="answer__marker__inner"></div>'; 
                }
                answerWrapper.appendChild(answerMarker);

                // Does this answer have an image
                for (i = 0; i < answerImages.length; i++) {
                    modules.adjustImage(answer, answerWrapper, answerImages[i], false);
                }

                // Does this answer have text
                for (i = 0; i < answerText.length; i++) {
                    modules.adjustText(answerMessage, answerText[i]);
                }
            },

            adjustImage: function (parent, wrapper, image, isQuestion) {
                if (image.getAttribute('src') !== '') {
                    parent.classList.add('has-image');
                    if (isQuestion) {
                        wrapper.parentNode.classList.add('question__img');
                    } else {
                        image.classList.add('answer__img');
                    }
                    wrapper.appendChild(image);
                } else {
                    image.parentNode.removeChild(image);
                }
            },

            adjustText: function (parent, text) {
                parent.appendChild(text);
            },

            IsAdBelowQuiz: function (quiz) {
                var IsAdBelowQuiz = false,
                    mpu = document.querySelector('.advert-slot__wrapper'),
                    mpuOffset,
                    quizOffset;

                if (mpu) {
                    mpuOffset = mpu.offsetTop;
                    quizOffset = quiz.offsetTop;

                    if (mpuOffset > quizOffset) {
                        IsAdBelowQuiz = true;
                    }
                }

                return IsAdBelowQuiz;
            },

            adjustAdPosition: function (yPos, startTime, timeStamp) {
                var newYPos,
                    progress;

                if (!startTime) {
                    startTime = timeStamp;
                }

                progress = timeStamp - startTime;
                newYPos = Ads.modules.updateMPUPosition(yPos);

                if (progress < 2000) {
                    window.animFrame(modules.adjustAdPosition.bind(null, newYPos, startTime));
                }
            },

            onNewsAnswerClick: function (answer, question, isImage) {
                var answerPara,
                    correctAnswerWrapper,
                    startTime = null,
                    yPos = null;

                if (question.classList.contains('answered')) {
                    return;
                }

                if (answer.dataset.correct === 'true') {
                    question.classList.add('is-correct');                    
                    modules.score++;
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
                    correctAnswerWrapper = answer.querySelector('.answer__message');
                    correctAnswerWrapper.appendChild(answerPara);
                }

                question.classList.add('answered');
                modules.numAnswered++;

                // If necessary set up a call to check mpu position
                if (modules.moveMPU) {
                    window.animFrame(modules.adjustAdPosition.bind(null, yPos, startTime));
                }

                // When we have an image answer we need to move the positioning of the explanation and marker 
                if (isImage) {
                    modules.showMarkedAnswer(question);
                }

                // If all questions have been answered display the score
                if (modules.questionCount === modules.numAnswered) {
                    modules.showScore();
                }
            },

            onPersonalityAnswerClick: function (answer, question) {
                var hightedAnswer;

                if (question.classList.contains('answered')) {
                    if (answer.classList.contains('highlight-answer') ||
                        modules.questionCount === modules.numAnswered) {
                        return;    
                    } else {
                        hightedAnswer = question.querySelector('.highlight-answer');
                        hightedAnswer.classList.remove('highlight-answer');
                        modules.quizBuckets[hightedAnswer.dataset.buckets].count--;
                        modules.numAnswered--;
                    }
                }

                if (modules.quizBuckets[answer.dataset.buckets]) {
                    question.classList.add('answered');
                    answer.classList.add('highlight-answer');
                    modules.numAnswered++;
                    modules.quizBuckets[answer.dataset.buckets].count++;

                    // If all questions have been answered display the score
                    if (modules.questionCount === modules.numAnswered) {
                        modules.showResult();
                    }
                }
            },

            showMarkedAnswer: function (question) {
                var i,
                    markedAnswer,
                    markedAnswers = question.querySelectorAll('.correct-answer, .wrong-answer'),
                    thisMessage,
                    thisHeight,
                    thisMarker;

                for (i = 0; i < markedAnswers.length; i++) {
                    markedAnswer = markedAnswers[i];
                    thisMessage = markedAnswer.querySelector('.answer__message');
                    thisHeight = thisMessage.offsetHeight;
                    thisMarker = markedAnswer.querySelector('.answer__marker');
                    // position explanation to the bottom of wrapper
                    thisMessage.style.top = 'calc(100% - ' + thisHeight + 'px)';
                    thisMarker.style.top = 'calc(100% - ' + (thisHeight - 7) + 'px)';
                }
            },

            showScore: function () {
                var i,
                    scoreDisplayMessage = '';

                for (i = 0; i < modules.score; i++) {
                    if (modules.scoreMessages[i]) {
                        scoreDisplayMessage = modules.scoreMessages[i];
                        break;
                    }
                }

                document.querySelector('.quiz-scores__correct').innerHTML = modules.score.toString();
                document.querySelector('.quiz-scores__message').innerHTML = scoreDisplayMessage;
                document.querySelector('.quiz-scores').classList.add('open');

                // Scroll score panel into view
                smoothScroll.animateScroll('#quiz-scores', null, {speed: 1500, offset: 40});
            },

            showResult: function () {
                var key,
                    bucket,
                    result,
                    resultTitle,
                    resultDescription;

                for (key in modules.quizBuckets) {
                    if (modules.quizBuckets.hasOwnProperty(key)) {
                        bucket = modules.quizBuckets[key];
                        if (!result || (bucket.count > result.count)) {
                            result = bucket;
                            resultDescription = result.description;
                            resultTitle = result.title;
                        }
                    }
                }

                document.querySelector('.quiz-results__description').innerHTML = resultDescription;
                document.querySelector('.quiz-results__title').innerHTML = resultTitle;
                document.querySelector('.quiz-results').classList.add('open');

                // Scroll result panel into view
                smoothScroll.animateScroll('#quiz-results', null, {speed: 1500, offset: 40});
            }
        },

        ready = function () {
            var quiz;

            if (!this.initialised) {
                this.initialised = true;
                quiz = document.querySelector('.element-atom .quiz');
                if (quiz) {
                    modules.init(quiz);
                }
            }
        };

    return {
        init: ready
    };

});