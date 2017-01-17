define([
    'bean',
    'modules/$'
], function(
    bean,
    $
) {
    'use strict';

    var initialised;

    function newCricketData(newHeader, newScorecard) {
        var header = document.getElementById('cricket-header');
        var scorecard = document.getElementById('cricket-scorecard');

        header.innerHTML = newHeader;
        scorecard.innerHTML = newScorecard;
    }

    function newCricketStatus(matchStatus) {
        var cricketWrapper = $('.cricket');
        //only doing this for cricket pre-match status atm - can change to something more robust if using for more things
        if (cricketWrapper.length && matchStatus === 'pre-match') {
            cricketWrapper.addClass('cricket--' + matchStatus);
        } else {
            cricketWrapper.removeClass('cricket--pre-match');
        }
    }

    function cricketMatchInfoFailed() {
        var header = $('#cricket-header');
        var scorecard = $('#cricket-scorecard');

        $('#cricket__tab--stats').remove();
        $('#cricket__tabpanel--stats').remove();
        if ($('.tabs [href="#cricket__tabpanel--stats"]').attr('aria-selected') === true) {
            $('.tabs a:first-of-type').attr('aria-selected', true);
            $($('.tabs [aria-selected="true"]').attr('href')).show();
        }

        header.remove();
        scorecard.remove();
    }

    function ready() {
        if (!initialised) {
            initialised = true;
            window.newCricketData = newCricketData;
            window.newCricketStatus = newCricketStatus;
            window.cricketMatchInfoFailed = cricketMatchInfoFailed;
        }
    }

    return {
        init: ready
    };
});