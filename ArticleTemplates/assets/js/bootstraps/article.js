/*global window,document,console,define */
define([
    'bean',
    'bonzo',
    'modules/$',
    'modules/twitter',
    'modules/witness',
    'modules/outbrain',
    'smoothScroll'
], function (
    bean,
    bonzo,
    $,
    twitter,
    witness,
    outbrain,
    smoothScroll
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

            // measure the viewport & set bg height
            var viewPortHeight = bonzo.viewport().height,
                bgHeight = (viewPortHeight - $('body').css('margin-top').replace('px','')) + 'px';

            // set article header height to viewport height
            $('.article__header').css('height', bgHeight); // For android that doesn't support 100vh

            // Amend the pub date style
            $('.quiz-meta .meta__pubdate').html($('.quiz-meta .meta__pubdate').html().replace(',','<br />'));

            // Append the quiz navigation bubble
            $('.article__header').append('<div class="quiz__navigation"><p class="quiz__start">Take the quiz</p></div>');

            // Store the answers and remove the answer elements
            var answers = $('.quiz__correct-answers').html().split(',');
            $('.quiz__correct-answers-title, .quiz__correct-answers').remove();

            // Store vars for scoring the quiz
            var numQuestions = answers.length,
                numAnswered = 0,
                score = 0;

            // Append the quiz scores popup
            $('.quiz').append('<div class="quiz-scores"><div class="quiz-scores__inner"></div></div>');
            var quizImage = $('#main-media-image')[0].cloneNode(true);
            $(quizImage).attr('id','').addClass('quiz-scores__img');
            $('.quiz-scores__inner').append('<div class="quiz-scores__close"></div>').append(quizImage).append('<p class="quiz-scores__score"></p>');
            bean.on(window, 'click.quizclose', $('.quiz-scores__close'), function() {
                $('.quiz-scores').removeClass('open');
            });

            // Loop through every question and set up the answers and click events for it's answers
            $('.quiz__question').each(function(question, index) {
                // Wrap question in a div for styling
                var questionWrapper = document.createElement('div'),
                    questionAnswerList = question.querySelectorAll('.question__answers');
                $(questionWrapper).addClass('question__wrapper');
                question.insertBefore(questionWrapper, questionAnswerList[0]);
                // Does this question have an image
                var questionImg = question.querySelectorAll(':scope > img');
                if (questionImg.length) {
                    if ($(questionImg).attr('src') !== '') {
                        $(question).addClass('hasImage');
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
                var correctAnswerResponse = answers[index].split(':')[1].split('-'),
                    correctAnswer = correctAnswerResponse[0].trim().toUpperCase(),
                    responseText =  correctAnswerResponse[1];

                // All the answers for this question
                var questionAnswers = this.querySelectorAll('.question__answer');

                // Loop through each answer and set up it's styling
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
                    var answerImg = answer.querySelectorAll(':scope > img');
                    if (answerImg.length) {
                        if ($(answerImg).attr('src') !== '') {
                            $(answer).addClass('hasImage');
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
                        $(answerWrapper).append(answerText);
                    }

                    // Find this answers alpha key
                    var thisAnswer = String.fromCharCode(65 + index);

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

                        // Flag this answer as correct or wrong
                        if (thisAnswer == correctAnswer) {
                            $(this).addClass('correct');
                            score ++;
                        } else {
                            $(this).addClass('wrong');
                        }

                        // Add the response text if we have any, if not create an empty element for image answers
                        if (responseText) {
                            $(answerWrapper).append('<p class="answer__explanation">' + responseText.trim() + '</p>');
                        } else if (answerImg.length) {
                            $(answerWrapper).append('<p class="answer__explanation">&nbsp;</p>');
                        }

                        // When we have an image answer we need to move the positioning of the explanation and marker 
                        if (answerImg.length) {
                            var answerExplanation = answer.querySelectorAll('.answer__explanation')[0],
                                answerExplanationHeight = answerExplanation.offsetHeight;
                                answerMarker = answer.querySelectorAll('.answer__marker')[0];
                            // position explanation to the bottom of wrapper
                            answerExplanation.style.top = 'calc(100% - ' + answerExplanationHeight + 'px)';
                            answerMarker.style.top = 'calc(100% - ' + (answerExplanationHeight - 7) + 'px)';
                        }

                        // If all questions have been answered display the score
                        if (numQuestions == numAnswered) {
                            $('.quiz-scores__score').html('<span class="quiz-scores__correct">' + score +'</span> / <span class="quiz-scores__questions">' + numQuestions + '</span>');
                            $('.quiz-scores').addClass('open');
                            $('.quiz__navigation').hide();
                        }
                    });
                });
            });

            // store all questions top offset for later
            $('.quiz__question').each(function(question, index){
               var offset = $(question).offset().top;
               $(question).attr({
                    'data-offset': offset,
                    'id': 'questionNum' + index
                });
            });

            // set up on scroll event for resizing quiz navigation button
            bean.on(window, 'scroll.quiz', window.ThrottleDebounce.throttle(250, false, function () {
                var currentScroll = window.scrollY;
                // is the first question at least half way into the viewport?
                if (currentScroll >= ($('.quiz__question').first().attr('data-offset') - (viewPortHeight * 0.5))) {
                    $('.quiz__navigation').addClass('down');
                } else {
                    $('.quiz__navigation').removeClass('down');
                }
            }));

            // set up the onclick for the quiz navigation button
            bean.on(window, 'click.quiz', $('.quiz__navigation'), window.ThrottleDebounce.debounce(10, false, function () {
                var currentScroll = window.scrollY,
                    scrolled = false;

                // Jump to the next question
                $('.quiz__question:not(.answered)').each(function(question, index) {
                    var thisOffset = $(question).attr('data-offset'),
                        thisID = '#' + $(question).attr('id');

                    if ((thisOffset > currentScroll) && !scrolled) {
                        smoothScroll.animateScroll(null, thisID);
                        scrolled = true;
                    }
                });
            }));
        },
        
        formatImmersive : function(){
            if (!$('.immersive').length) {
                return false;
            }

            var viewPortHeight = bonzo.viewport().height,
                bgHeight = (viewPortHeight - $('body').css('margin-top').replace('px','')) + 'px',
                // progressBar = $('.progress__bar'),
                pageOffset = viewPortHeight * 0.75;

            // Override tone to feature for all immersive pages
            document.body.className = document.body.className.replace( /(tone--).+?\s/g , 'tone--feature1 ' );

            // set header image height to viewport height
            $('.article__header-bg, .article__header-bg .element > iframe').css('height', bgHeight);
            
            // TODO: This is just not a fix, we actually need for the embed to be sent through with prefixed & unprefixed styles
            var iframe = $('.article__header-bg .element > iframe');
            if (iframe) {
                var newSrc = iframe[0].srcdoc
                    .replace("transform: translate(-50%, -50%);", "-webkit-transform: translate(-50%, -50%); transform: translate(-50%, -50%);")
                    .replace(/-webkit-animation/g, "animation")
                    .replace(/animation/g, "-webkit-animation")
                    .replace(/@keyframes/g, "@-webkit-keyframes");
                iframe[0].srcdoc = newSrc;
            }
            
            // for each element--immersive add extra classes depending on siblings
            $('figure.element--immersive').each(function(){
                if($(this).next().hasClass('element-pullquote')){
                    $(this).next().addClass('quote--image');
                    $(this).addClass('quote--overlay').data('data-thing', '');
                }
                
                if($(this).next()[0].tagName === "H2"){
                    $(this).next().addClass('title--image');
                    $(this).addClass('title--overlay');
                    $(this).next().next().addClass('has__dropcap');
                }
            });

            // find all the section seperators & add classes
            $('.article h2').each(function() {
                if ($(this).html() === '* * *') {
                    $(this).html('').addClass('section__rule').next().addClass('has__dropcap');
                }
            });

            var articleHeight = $('.article').offset().height; // measure article height after other adjustments so it is accurate
            // create chapter markers
            // modules.addProgressBarChapters(progressBar, articleHeight);

            // store all pullquotes top offset for later
            $('.element-pullquote').each(function(){
               var $this = $(this),
                    offset = $this.offset().top;
               $this.attr('data-offset', offset);
            });

            // set up click event for displaying figcaption
            bean.on(window, 'click.quote-overlay', $('.quote--overlay'), function(e) {
                e.preventDefault();
                $(this.querySelector('figcaption')).toggleClass('display');
            });

            // set up on scroll event for sliding pullquote into view and updating progress bar
            bean.on(window, 'scroll.immersive', window.ThrottleDebounce.debounce(10, false, function () {
                // slide pull-quotes into view
                $('.element-pullquote').each(function(){
                    var $this = $(this),
                        dataOffset = $this.attr('data-offset');

                    if(window.scrollY >= (dataOffset - pageOffset)) {
                        $this.addClass('animated').addClass('fadeInUp');
                    }
                });

                // update progress bar
                // modules.updateProgressBar(progressBar, articleHeight);
            }));


            // add a resize / orientation event to redraw the chapter positions for new article height
            bean.on(window, 'resize.cards orientationchange.cards', window.ThrottleDebounce.debounce(100, false, function () {
                // remeasure article height 
                articleHeight = $('.article').offset().height; // measure article height after other adjustments so it is accurate

                // empty the progress bar div 
                // progressBar.html('');

                // redraw chapter markets
                // modules.addProgressBarChapters(progressBar, articleHeight);

                // update progress position
                // modules.updateProgressBar(progressBar, articleHeight);

                // set header image height to new viewport height
                viewPortHeight = bonzo.viewport().height;
                bgHeight = (viewPortHeight - $('body').css('margin-top').replace('px','')) + 'px';
                $('.article__header-bg, .article__header-bg .element > iframe').css('height', bgHeight);
                
            }));

            // call updateProgressBar on first load
            // modules.updateProgressBar(progressBar, articleHeight);
        },

        addProgressBarChapters: function(progressBar, articleHeight) {
            $('.article h2').each(function() {
                var chapterPosition = Math.floor(($(this).offset().top / articleHeight) * 100) + "%",
                    thisChapter = '<div style="left:'+ chapterPosition + ';" class="progress__chapter"></div>';
                progressBar.append(thisChapter);
            });
        },

        updateProgressBar: function(progressBar, articleHeight) {
            var scrollPosition = (window.scrollY / articleHeight * 100) + "%";
            progressBar.css('width', scrollPosition);
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
            modules.formatImmersive();
        }
    };

    return {
        init: ready
    };
});
