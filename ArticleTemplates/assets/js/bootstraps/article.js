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
                // This questions correct answer
                var correctAnswer = answers[index].split(':')[1].toUpperCase();
                
                // All the answers for this question
                var questionAnswers = this.querySelectorAll('.question__answer');

                $(questionAnswers).each(function(answer, index) {
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

                        $(this).append('<p class="answer__explanation">This is the answer explanation, which will show up after either the correct or wrong answer</p>');

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
