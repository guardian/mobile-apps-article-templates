define(function() {
    'use strict';

    var initialised;

    function newCricketData(newHeader, newScorecard) {
        var header = document.getElementById('cricket-header');
        var scorecard = document.getElementById('cricket-scorecard');

        if (header) {
            header.innerHTML = newHeader;
        }
        
        if (scorecard) {
            scorecard.innerHTML = newScorecard;
        }
    }

    function newCricketStatus(matchStatus) {
        var cricketWrapper = document.getElementsByClassName('cricket')[0];
        
        if (cricketWrapper && matchStatus === 'pre-match') {
            cricketWrapper.classList.add('cricket--' + matchStatus);
        } else {
            cricketWrapper.classList.remove('cricket--pre-match');
        }
    }

    function cricketMatchInfoFailed() {
        var header = document.getElementById('cricket-header');
        var scorecard = document.getElementById('cricket-scorecard');
        var cricketTabStats = document.getElementById('cricket__tab--stats');
        var cricketTabPanelStats = document.getElementById('cricket__tabpanel--stats');

        if (cricketTabStats && cricketTabStats.getAttribute('aria-selected') === 'true') {
            var firstTab = document.querySelector('.tabs a:first-of-type');

            if (firstTab) {
                var firstPanel = document.querySelector(firstTab.getAttribute('href'));

                firstTab.setAttribute('aria-selected', 'true');
                firstPanel.style.display = 'block';
            }
        }

        removeElement(cricketTabStats);
        removeElement(cricketTabPanelStats);
        removeElement(header);
        removeElement(scorecard);
    }

    function removeElement(elem) {
        if (elem && elem.parentNode) {
            elem.parentNode.removeChild(elem);
        }
    }

    function setupGlobals() {
        // Global function to handle cricket, called by native code
        window.newCricketData = newCricketData;
        window.newCricketStatus = newCricketStatus;
        window.cricketMatchInfoFailed = cricketMatchInfoFailed;
    }

    function ready() {
        if (!initialised) {
            initialised = true;
            setupGlobals();
        }
    }

    return {
        init: ready
    };
});