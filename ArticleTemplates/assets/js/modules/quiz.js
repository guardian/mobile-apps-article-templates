/*global window,console,define */
define([
    'bean',
    'bonzo',
    'modules/$',
    'smoothScroll',
    'modules/ads'
], function (
    bean,
    bonzo,
    $,
    smoothScroll,
    Ads
) {
    'use strict';

    var modules = {
        quizInit: function(quiz) {
            var $quiz = $(quiz);

            if (!$quiz.length) {
                return false;
            }

            // Do we have an MPU and is it below the quiz?
            var mpu = $('#advert-slot__wrapper'),
                moveMPU = false;

            if (mpu.length) {
                var mpuOffset = mpu.offset().top,
                    quizOffset = $quiz.offset().top;

                if (mpuOffset > quizOffset) {
                    moveMPU = true;
                }
            }

            // Update MPU position on animation
            var startTime = null,
                yPos = null;

            function checkMPU(timestamp) {
                if (!startTime) {
                    startTime = timestamp;
                }

                var progress = timestamp - startTime;
                
                var newYPos = Ads.modules.updateMPUPosition(yPos);
                yPos = newYPos;

                if (progress < 2000) {
                    window.animFrame(checkMPU);
                }
            }

            // Store the answers and remove the answer elements
            var answers = $('.quiz__correct-answers').html().split(',');
            $('.quiz__correct-answers-title, .quiz__correct-answers').remove();

            // Store vars for scoring the quiz
            var numQuestions = answers.length,
                numAnswered = 0,
                score = 0,
                scoreMessages = {},
                longestMessageLength = 0,
                longestMessage;

            // Store the result messages
            $('.quiz__scores > li').each(function(){
                var $this = $(this),
                    message = $this.attr('data-title');

                // Add this message to the array
                scoreMessages[Math.max($this.attr('data-min-score'),0)] = message;
            });

            // Build up the quiz results panel
            $quiz.append('<div id="quiz-scores" class="quiz-scores"><p class="quiz-scores__score">' +
                '<span class="quiz-scores__correct"></span> / <span class="quiz-scores__questions">' +
                numQuestions + '</span></p><p class="quiz-scores__message"></p></div>');

            // Loop through every question and set up the answers and click events for it's answers
            $('.quiz__question').each(function(question, index) {
                // Wrap question in a div for styling
                var questionWrapper = document.createElement('div'),
                    questionAnswerList = question.querySelectorAll('.question__answers');
                $(questionWrapper).addClass('question__wrapper');
                question.insertBefore(questionWrapper, questionAnswerList[0]);

                // Does this question have an image (if tools stripped out empty image tags some of this would be unnecessary)
                var questionImg = question.querySelectorAll(':scope > img');
                if (questionImg.length) {
                    if ($(questionImg).attr('src') !== '') {
                        $(question).addClass('has-image');
                        $(questionImg).addClass('question__img');
                        $(questionWrapper).append(questionImg);
                    } else {
                        $(questionImg).remove();
                    }
                }

                // Does this question have text
                var questionText = question.querySelectorAll('.question__text');
                if (questionText.length) {
                    $(questionWrapper).append(questionText);
                }

                // This question's correct answer & response text
                var $correctAnswer,
                    $correctAnswerWrapper,
                    correctAnswerArray = answers[index].split(':')[1].split('-'),
                    correctAnswerCode = correctAnswerArray[0].trim().toUpperCase(),
                    correctAnswerExplanation = correctAnswerArray[1];

                // All the answers for this question
                var questionAnswers = this.querySelectorAll('.question__answer');

                // Loop through each answer and set up it's styling
                $(questionAnswers).each(function(answer, index) {
                    // Wrap answer in a div for styling
                    var answerWrapper = document.createElement('div');
                    $(answerWrapper).addClass('answer__wrapper');
                    $(answer).append(answerWrapper);
                    
                    // Add an answer message div to wrap text answer, correct/wrong message and explanation response
                    var answerMessage = document.createElement('div');
                    $(answerMessage).addClass('answer__message');
                    $(answerWrapper).append(answerMessage);

                    // Add a marker icon span 
                    var answerMarker = document.createElement('div');
                    $(answerMarker).addClass('answer__marker');
                    $(answerWrapper).append(answerMarker);
                    
                    // Does this answer have an image (if tools stripped out empty image tags some of this would be unnecessary)
                    var answerImg = answer.querySelectorAll(':scope > img');
                    if (answerImg.length) {
                        if ($(answerImg).attr('src') !== '') {
                            $(answer).addClass('has-image');
                            $(answerImg).addClass('answer__img');
                            $(answerWrapper).append(answerImg);
                        } else {
                            $(answerImg).remove();
                            answerImg = '';
                        }
                    }

                    // Does this answer have text
                    var answerText = answer.querySelectorAll('.answer__text');
                    if (answerText.length) {
                        $(answerMessage).append(answerText);
                    }
                    
                    // Find this answers alpha key
                    var thisAnswer = String.fromCharCode(65 + index);
                    
                    // Is this answer the correct answer
                    if (thisAnswer == correctAnswerCode) {
                        $correctAnswer = $(answer);
                        $correctAnswerWrapper = $(answerMessage);
                    }

                    // Set up an onclick to handle when a user selects this answer
                    bean.on(answer, 'click', function() {
                        if ($(question).hasClass('answered')) {
                            // Question has already been answered 
                            return false;
                        } else {
                            // Mark question as answered and keep track of total q's answered
                            $(question).addClass('answered');
                            numAnswered ++;
                        }

                        // If necessary set up a call to check mpu position
                        if (moveMPU) {
                            startTime = null;
                            window.animFrame(checkMPU);
                        }

                        // Flag the correct answer & add response if one is available
                        $correctAnswer.addClass('correct-answer');
                        if (correctAnswerExplanation) {
                            $correctAnswerWrapper.append('<p class="answer__explanation">' + correctAnswerExplanation.trim() + '</p>');
                        }

                        // Check if this answer is correct & mark question as correct or wrong
                        if (thisAnswer == correctAnswerCode) {
                            $(question).addClass('is-correct');
                            score ++;
                        } else {
                            $(question).addClass('is-wrong');
                            $(this).addClass('wrong-answer');
                        }

                        // When we have an image answer we need to move the positioning of the explanation and marker 
                        if (answerImg.length) {
                            var markedAnswers = question.querySelectorAll('.correct-answer, .wrong-answer');

                            $(markedAnswers).each(function(markedAnswer, index) {
                                var thisMessage = markedAnswer.querySelectorAll('.answer__message')[0],
                                    thisHeight = thisMessage.offsetHeight,
                                    thisMarker = markedAnswer.querySelectorAll('.answer__marker')[0];

                                    // position explanation to the bottom of wrapper
                                    thisMessage.style.top = 'calc(100% - ' + thisHeight + 'px)';
                                    thisMarker.style.top = 'calc(100% - ' + (thisHeight - 7) + 'px)';
                            });
                        }
                        // If all questions have been answered display the score
                        if (numQuestions == numAnswered) {
                            var scoreDisplayMessage = "";
                            for(var i = score; i >= 0; i--) {
                                if (scoreMessages[i]) {
                                    scoreDisplayMessage = scoreMessages[i]; 
                                    break;
                                }
                            }

                            // Add the score & message into resultPanel
                            $('.quiz-scores__correct').html(score.toString());
                            $('.quiz-scores__message').html(scoreDisplayMessage);

                            // Add open class to trigger transition
                            $('.quiz-scores').addClass('open');

                            // Scroll score panel into view
                            smoothScroll.animateScroll(null, '#quiz-scores', { speed: 1500, offset: 40 });
                        }
                    });
                });
            });

            // show the quiz
            $quiz.addClass("loaded");
        }
    },

    ready = function () {
        if (!this.initialised) {
            this.initialised = true;
            var quiz = $('.element-atom .quiz');
            if (quiz.length) {
                // We have a quiz atom on the page so setup the quizzes
                modules.quizInit(quiz[0]);
            }
        }
    };

    return {
        init: ready
    };

});