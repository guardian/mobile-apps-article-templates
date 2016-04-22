/*global window,console,define */
define([
    'bean',
    'bonzo',
    'modules/$',
    'smoothScroll',
    'modules/ads'
], function(
    bean,
    bonzo,
    $,
    smoothScroll,
    Ads
) {
    'use strict';

    var modules = {
            init: function (quiz) {
                modules.answers = document.querySelector('.quiz__correct-answers').innerHTML.split(',');
                
                modules.moveMPU = modules.IsAdBelowQuiz(quiz);

                modules.removeAnswers();

                modules.scoreMessages = modules.getScoreMessages();

                modules.buildResultsPanel(quiz);

                modules.setupQuestions();

                modules.numAnswered = 0;

                modules.score = 0;

                quiz.classList.add("loaded");
            },
            IsAdBelowQuiz: function (quiz) {
                // Do we have an MPU advert and is it below the quiz?
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
            removeAnswers: function () {
                var answers = document.querySelectorAll('.quiz__correct-answers-title, .quiz__correct-answers'),
                    i;

                for (i = 0; i < answers.length; i++) {
                    answers[i].parentNode.removeChild(answers[i]);
                }
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
            buildResultsPanel: function (quiz) {
                var resultPanel = document.createElement("div");

                resultPanel.classList.add("quiz-scores");
                resultPanel.id = "quiz-scores";
                resultPanel.innerHTML = '<p class="quiz-scores__score">' +
                    '<span class="quiz-scores__correct"></span> / <span class="quiz-scores__questions">' +
                    modules.answers.length + '</span></p><p class="quiz-scores__message"></p>';

                quiz.appendChild(resultPanel);
            },
            setupQuestions: function () {
                var i,
                    j,
                    k,
                    question,
                    questionImages,
                    questions = document.querySelectorAll('.quiz__question'),
                    questionText,
                    questionWrapper;

                for (i = 0; i < questions.length; i++) {
                    question = questions[i];
                    questionWrapper = modules.wrapQuestion(question);
                    questionImages = question.querySelectorAll(':scope > img');

                    for (j = 0; j < questionImages.length; j++) {
                        modules.adjustQuestionImage(question, questionWrapper, questionImages[j]);
                    }

                    questionText = question.querySelectorAll('.question__text');

                    for (k = 0; k < questionText.length; k++) {
                        modules.adjustQuestionText(questionWrapper, questionText[k]);
                    }

                    modules.adjustAnswers(question, i);
                }
            },
            wrapQuestion: function (question) {
                var questionWrapper = document.createElement('div'),
                    questionAnswerList = question.querySelectorAll('.question__answers');

                questionWrapper.classList.add('question__wrapper');

                question.insertBefore(questionWrapper, questionAnswerList[0]);

                return questionWrapper;
            },
            adjustQuestionImage: function (question, questionWrapper, image) {
                if (image.getAttribute('src') !== '') {
                    question.classList.add('has-image');
                    image.classList.add('question__img');
                    questionWrapper.appendChild(image);
                } else {
                    image.parentNode.removeChild(image);
                }
            },
            adjustQuestionText: function (questionWrapper, questionText) {
                questionWrapper.appendChild(questionText);
            },
            adjustAnswers: function (question, index) {
                var i,
                    questionAnswers = question.querySelectorAll('.question__answer');

                for (i = 0; i < questionAnswers.length; i++) {
                    modules.styleAnswer(questionAnswers[i], i, question, index);
                }
            },
            styleAnswer: function (answer, answerIndex, question, questionIndex) {
                var answerImages = answer.querySelectorAll(':scope > img'),
                    answerMarker = document.createElement('div'),
                    answerMessage = document.createElement('div'),
                    answerWrapper = document.createElement('div'),
                    answerText = answer.querySelectorAll('.answer__text'),
                    i,
                    j;

                // Wrap answer in a div for styling
                answerWrapper.classList.add('answer__wrapper');
                answer.appendChild(answerWrapper);

                // Add an answer message div to wrap text answer, correct/wrong message and explanation response
                answerMessage.classList.add('answer__message');
                answerWrapper.appendChild(answerMessage);

                // Add a marker icon span
                answerMarker.classList.add('answer__marker');
                answerWrapper.appendChild(answerMarker);

                // Does this answer have an image (if tools stripped out empty image tags some of this would be unnecessary)
                for (i = 0; i < answerImages.length; i++) {
                    modules.adjustAnswerImage(answer, answerWrapper, answerImages[i]);
                }
                
                // Does this answer have text
                for (j = 0; j < answerText.length; j++) {
                    modules.adjustAnswerText(answerMessage, answerText[j]);
                }

                // Set up an onclick to handle when a user selects this answer
                answer.addEventListener('click', modules.onAnswerClick.bind(null, answer, answerIndex, question, questionIndex, answerMessage, answerImages));
            },
            adjustAnswerImage: function (answer, answerWrapper, image) {
                if (image.getAttribute('src') !== '') {
                    answer.classList.add('has-image');
                    answer.classList.add('answer__img');
                    answerWrapper.appendChild(image);
                } else {
                    image.parentNode.removeChild(image);
                }
            },
            adjustAnswerText: function (answerMessage, answerText) {
                answerMessage.appendChild(answerText);
            },
            onAnswerClick: function (answer, answerIndex, question, questionIndex, answerMessage, answerImages) {
                console.log(answer, answerIndex, question, questionIndex);

                var answerPara,
                    correctAnswer,
                    correctAnswerWrapper,
                    correctAnswerArray = modules.answers[questionIndex].split(':')[1].split('-'),
                    correctAnswerCode = correctAnswerArray[0].trim().toUpperCase(),
                    correctAnswerExplanation = correctAnswerArray[1],
                    i,
                    markedAnswers,
                    thisAnswer = String.fromCharCode(65 + answerIndex),
                    startTime = null,
                    yPos = null;

                if (question.classList.contains('answered')) {
                    return;
                }

                if (thisAnswer === correctAnswerCode) {
                    correctAnswer = answer;
                    correctAnswerWrapper = answerMessage;
                    correctAnswer.classList.add('correct-answer');

                    if (correctAnswerExplanation) {
                        answerPara = document.createElement("p");
                        answerPara.classList.add("answer__explanation");
                        answerPara.innerHTML =  correctAnswerExplanation.trim();
                        correctAnswerWrapper.appendChild(answerPara);
                    }

                    question.classList.add('is-correct');
                    modules.score ++;
                } else {
                    question.classList.add('is-wrong');
                    answer.classList.add('wrong-answer');
                }

                question.classList.add('answered');
                modules.numAnswered++;

                // If necessary set up a call to check mpu position
                if (modules.moveMPU) {
                    window.animFrame(modules.adjustAdPosition.bind(null, yPos, startTime));
                }
                
                // When we have an image answer we need to move the positioning of the explanation and marker 
                if (answerImages.length) {
                    modules.showMarkedAnswer(question);
                }

                // If all questions have been answered display the score
                if (modules.answers.length == modules.numAnswered) {
                    // var scoreDisplayMessage = "";
                    // for(var i = score; i >= 0; i--) {
                    //     if (scoreMessages[i]) {
                    //         scoreDisplayMessage = scoreMessages[i]; 
                    //         break;
                    //     }
                    // }

                    // // Add the score & message into resultPanel
                    // $('.quiz-scores__correct').html(score.toString());
                    // $('.quiz-scores__message').html(scoreDisplayMessage);

                    // // Add open class to trigger transition
                    // $('.quiz-scores').addClass('open');

                    // // Scroll score panel into view
                    // smoothScroll.animateScroll(null, '#quiz-scores', { speed: 1500, offset: 40 });
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
            }
        },
        ready = function() {
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