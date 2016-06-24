/*global window,document,console,define */
define([
    'bean',
    'modules/$'
], function (
    bean,
    $
) {
    'use strict';

    var modules = {
        paginate: function(){

            var sheet = document.getElementById('cricket-scorecard-batsmen-sheet');
            var wrap = document.getElementById('cricket-scorecard-batsmen-wrap');

            var updatePosition = function(){};
            wrap.removeEventListener('animationiteration', updatePosition);
            wrap.removeEventListener('webkitAnimationIteration', updatePosition);

            var card = document.getElementById('cricket-match-summary-scorecard');
            if(sheet && card){
                var title = card.getElementsByClassName('cricket-scorecard-title')[0];
                var batsmen = sheet.getElementsByClassName('cricket-scorecard-batsmen')[0];
                if(batsmen){
                    var batsmenHeight = batsmen.getBoundingClientRect().height;
                    var pages = Math.ceil(sheet.getBoundingClientRect().height / batsmenHeight);
                    if(pages > 1){
                        card.setAttribute('data-pages', pages);
                        var bullets = '<div class="cricket-scorecard-bullets" id="cricket-scorecard-bullets">';
                        for(var page = 0; page < pages; page++){
                            bullets += '<span class="' + (page === 0 ? 'cricket-scorecard-bullets--active' : '') + '"></span>';
                        }
                        title.insertAdjacentHTML('beforeend', bullets + '</div>');

                        var currentPage = 0;
                        var htmlBullets = title.querySelectorAll('.cricket-scorecard-bullets span');

                        updatePosition = function(){
                            currentPage = ++currentPage % pages;
                            sheet.style.webkitTransform = sheet.style.transform = "TranslateY(" + ( -1 * currentPage * batsmenHeight) + "px)";
                            wrap.style.opacity = 0;
                            for(var bullet = 0; bullet < htmlBullets.length; bullet++){
                                if(currentPage === bullet){
                                    htmlBullets[bullet].classList.add('cricket-scorecard-bullets--active');
                                }else{
                                    htmlBullets[bullet].classList.remove('cricket-scorecard-bullets--active');
                                }
                            }
                        };

                        wrap.addEventListener('animationiteration', updatePosition);
                        wrap.addEventListener('webkitAnimationIteration', updatePosition);
                    }
                }
            }
        },
        newCricketData: function(newHeader, newScorecard){
            var header = document.getElementById('cricket-header');
            var scorecard = document.getElementById('cricket-scorecard');

            header.innerHTML = newHeader;
            scorecard.innerHTML = newScorecard;
        },
        newCricketStatus: function (matchStatus) {
            var cricketWrapper = $('.cricket');
            //only doing this for cricket pre-match status atm - can change to something more robust if using for more things
            if (cricketWrapper.length && matchStatus === 'pre-match') {
                cricketWrapper.addClass('cricket--' + matchStatus);
            }
            else {
                 cricketWrapper.removeClass('cricket--pre-match');
            }
        },
        cricketMatchInfoFailed: function(){
            var header = $('#cricket-header');
            var scorecard = $('#cricket-scorecard');

            $('#cricket__tab--stats').remove();
            $('#cricket__tabpanel--stats').remove();
            if ($('.tabs [href="#cricket__tabpanel--stats"]').attr("aria-selected") === true) {
                $('.tabs a:first-of-type').attr("aria-selected", true);
                $($('.tabs [aria-selected="true"]').attr("href")).show();
            }

            header.remove();
            scorecard.remove();
        }
    };

    var ready = function () {
        if (!this.initialised) {
            this.initialised = true;
            //modules.paginate();
            window.newCricketData = modules.newCricketData;
            window.newCricketStatus = modules.newCricketStatus;
            window.cricketMatchInfoFailed = modules.cricketMatchInfoFailed;
        }
    };

    return {
        init: ready,
        modules: modules
    };
});
