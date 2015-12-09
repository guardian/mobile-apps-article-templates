/*global window,document,console,define */
define([
    'bean',
    'modules/$',
    'modules/twitter',
    'modules/witness',
    'modules/outbrain'
], function (
    bean,
    $,
    twitter,
    witness,
    outbrain
) {
    'use strict';

    var modules = {
        insertOutbrain: function () {
            window.articleOutbrainInserter = function () {
                outbrain.load();
            };
            window.applyNativeFunctionCall('articleOutbrainInserter');
        },
        quizInit: function() {
            var quiz = $('.quiz');
            
            if (!quiz) {
                return false;
            }

            // Store the answers and remove the answer elements
            var answers = $('.quiz__correct-answers').html().split(',');
            $('.quiz__correct-answers-title, .quiz__correct-answers').remove();

            // Store vars for scoring the quiz
            var numQuestions = answers.length,
                numAnswered = 0,
                score = 0;

            // Hide the scores elements for now
            $('.quiz__scores-title, .quiz__scores').hide();

            // Loop through every question and set up the answers and click events for it's answers
            $('.quiz__question').each(function(question, index) {
                // Wrap question in a div for styling
                var questionWrapper = document.createElement('div'),
                    questionAnswerList = question.querySelectorAll('.question__answers');
                $(questionWrapper).addClass('question__wrapper');
                question.insertBefore(questionWrapper, questionAnswerList[0]);
                // Does this question have an image
                var questionImg = question.querySelectorAll('.question__img');
                if (questionImg.length) {
                    $(question).addClass('hasImage');
                    $(questionWrapper).append(questionImg);
                }
                // Does this question have text
                var questionText = question.querySelectorAll('.question__text');
                if (questionText.length) {
                    $(questionWrapper).append(questionText);
                }

                // This question's correct answer
                var correctAnswer = answers[index].split(':')[1].toUpperCase();
                
                // All the answers for this question
                var questionAnswers = this.querySelectorAll('.question__answer');

                $(questionAnswers).each(function(answer, index) {
                    // Wrap answer in a div for styling
                    var answerWrapper = document.createElement('div');
                    $(answerWrapper).addClass('answer__wrapper');
                    $(answer).append(answerWrapper);
                    // Add a marker icon span 
                    var answerMarker = document.createElement('div');
                    $(answerMarker).addClass('answer__marker');
                    $(answerWrapper).append(answerMarker);
                    // Does this answer have an image
                    var answerImg = answer.querySelectorAll('.answer__img');
                    if (answerImg.length) {
                        $(answer).addClass('hasImage');
                        $(answerWrapper).append(answerImg);
                    }
                    // Does this answer have text
                    var answerText = answer.querySelectorAll('.answer__text');
                    if (answerText.length) {
                        $(answerWrapper).append(answerText);
                    }

                    // Find this answers alpha key
                    var thisAnswer = String.fromCharCode(65 + index);

                    // Set up an onclick to handle when a user selects this answer
                    bean.on(answer, 'click', function() {
                        if ($(question).hasClass('answered')) {
                            return false;
                        } else {
                            $(question).addClass('answered');
                            numAnswered ++;
                        }

                        if (thisAnswer == correctAnswer) {
                            $(this).addClass('correct');
                            score ++;
                        } else {
                            $(this).addClass('wrong');
                        }

                        $(answerWrapper).append('<p class="answer__explanation">This is the answer explanation, which will show up after either the correct or wrong answer</p>');

                        // When we have an image answer we need to move the positioning of the explanation and marker 
                        if (answerImg.length) {
                            var answerExplanation = answer.querySelectorAll('.answer__explanation')[0],
                                answerExplanationHeight = answerExplanation.offsetHeight;
                                answerMarker = answer.querySelectorAll('.answer__marker')[0];
                            // position explanation to the bottom of wrapper
                            answerExplanation.style.top = 'calc(100% - ' + answerExplanationHeight + 'px)';
                            answerMarker.style.top = 'calc(100% - ' + (answerExplanationHeight - 7) + 'px)';
                        }

                        if (numQuestions == numAnswered) {
                            $('.quiz__scores').html('<span class="quiz__score">' + score +'</span> out of <span class="quiz__number-questions">' + numQuestions + '</span>');
                            $('.quiz__scores-title, .quiz__scores').show();
                        }
                    });
                });
            });
        }
    },

    ready = function () {
        if (!this.initialised) {
            this.initialised = true;
            twitter.init();
            twitter.enhanceTweets();
            witness.duplicate();
            modules.insertOutbrain();
            modules.quizInit();
        }
    };

    return {
        init: ready
    };
});
