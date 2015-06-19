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
            var card = document.getElementById('cricket-match-summary-scorecard');
            if(sheet && card){
                var title = card.querySelector('.cricket-scorecard-title');
                var batsmen = sheet.querySelector('.cricket-scorecard-batsmen');
                if(batsmen){
                    var batsmenHeight = batsmen.getBoundingClientRect().height;
                    var pages = Math.ceil(sheet.getBoundingClientRect().height / batsmenHeight);
                    card.setAttribute('data-pages', pages);
                    if(pages > 1){
                        var bullets = '<div class="cricket-scorecard-bullets">';
                        for(var page = 0; page < pages; page++){
                            bullets += '<span class="' + (page === 0 ? 'cricket-scorecard-bullets--active' : '') + '"></span>';
                        }
                        title.insertAdjacentHTML('beforeend', bullets + '</div>');

                        var currentPage = 0;
                        var htmlBullets = title.querySelectorAll('.cricket-scorecard-bullets span');
                        var updatePosition = function(){
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
        }
    };

    var ready = function () {
        if (!this.initialised) {
            this.initialised = true;
            modules.paginate();
        }
    };

    return {
        init: ready
    };
});
