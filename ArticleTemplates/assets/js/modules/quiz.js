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
                modules.isPersonalityQuiz = document.getElementsByClassName('quiz__buckets')[0];
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
                    questionsAndAnswers = modules.getQuestionsAndAnswers(),
                    question,
                    questions = document.getElementsByClassName('quiz__question'),
                    questionObj;

                for (i = 0; i < questions.length; i++) {
                    question = questions[i];
                    questionObj = questionsAndAnswers[i+1];
                    questionObj.elem = question;
                    modules.wrapQuestion(question);
                    modules.setupNewsQuizAnswers(questionObj);
                    modules.questionCount++;
                }
            },

            setupNewsQuizAnswers: function (questionObj) {
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
                    modules.styleAnswer(answers[i]);
                    answers[i].addEventListener('click', modules.onNewsAnswerClick.bind(null, answers[i], questionObj.elem, answers[i].getElementsByTagName('img')[0]));
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

                modules.quizBuckets = quizBuckets;
            },

            setupPersonalityQuizQuestions: function () {
                var i,
                    question,
                    questions = document.getElementsByClassName('quiz__question'),
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
                    answers = questionObj.elem.getElementsByClassName('question__answer');

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

            getQuestionsAndAnswers: function () {
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
                            answers[question].revealText = ''
                        }
                        answers[question].revealText += correctAnswerWordList[i] + ' ';
                    }
                }

                for (key in answers) {
                    if (answers.hasOwnProperty(key) && answers[key].revealText) {
                        // Remove trailing comma in revealText
                        answers[key].revealText = answers[key].revealText.replace(/,\s*$/, "");
                    }
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
                    questionAnswerList = question.getElementsByClassName('question__answers'),
                    questionImages = question.querySelectorAll(':scope > img'),
                    questionText = question.getElementsByClassName('question__text');

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
                // make sure parent height is not less than text height
                if (parent.offsetHeight < text.offsetHeight) {
                    parent.style.height = text.offsetHeight + 'px';
                }
            },

            IsAdBelowQuiz: function (quiz) {
                var IsAdBelowQuiz = false,
                    mpu = document.getElementsByClassName('advert-slot__wrapper')[0],
                    mpuOffset,
                    quizOffset;

                if (mpu) {
                    mpuOffset = GU.util.getElementOffset(mpu).top;
                    quizOffset = GU.util.getElementOffset(quiz).top;

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
                newYPos = Ads.updateMPUPosition(yPos);

                if (progress < 2000) {
                    window.requestAnimationFrame(modules.adjustAdPosition.bind(null, newYPos, startTime));
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
                    correctAnswerWrapper = answer.getElementsByClassName('answer__message')[0];
                    correctAnswerWrapper.appendChild(answerPara);
                }

                question.classList.add('answered');
                modules.numAnswered++;

                // If necessary set up a call to check mpu position
                if (modules.moveMPU) {
                    window.requestAnimationFrame(modules.adjustAdPosition.bind(null, yPos, startTime));
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
                        hightedAnswer = question.getElementsByClassName('highlight-answer')[0];
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
                    thisMessage = markedAnswer.getElementsByClassName('answer__message')[0];
                    thisHeight = thisMessage.offsetHeight;
                    thisMarker = markedAnswer.getElementsByClassName('answer__marker')[0];
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
                    }
                }

                document.getElementsByClassName('quiz-scores__correct')[0].innerHTML = modules.score.toString();
                document.getElementsByClassName('quiz-scores__message')[0].innerHTML = scoreDisplayMessage;
                document.getElementsByClassName('quiz-scores')[0].classList.add('open');

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

                document.getElementsByClassName('quiz-results__description')[0].innerHTML = resultDescription;
                document.getElementsByClassName('quiz-results__title')[0].innerHTML = resultTitle;
                document.getElementsByClassName('quiz-results')[0].classList.add('open');

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