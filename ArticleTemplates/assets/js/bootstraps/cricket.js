function newCricketData(newHeader, newScorecard) {
    const header = document.getElementById('cricket-header');
    const scorecard = document.getElementById('cricket-scorecard');

    if (header) {
        header.innerHTML = newHeader;
    }

    if (scorecard) {
        scorecard.innerHTML = newScorecard;
    }
}

function newCricketStatus(matchStatus) {
    const cricketWrapper = document.getElementsByClassName('cricket')[0];

    if (cricketWrapper && matchStatus === 'pre-match') {
        cricketWrapper.classList.add(`cricket--${matchStatus}`);
    } else {
        cricketWrapper.classList.remove('cricket--pre-match');
    }
}

function cricketMatchInfoFailed() {
    const header = document.getElementById('cricket-header');
    const scorecard = document.getElementById('cricket-scorecard');
    const cricketTabStats = document.getElementById('cricket__tab--stats');
    const cricketTabPanelStats = document.getElementById('cricket__tabpanel--stats');

    if (cricketTabStats && cricketTabStats.getAttribute('aria-selected') === 'true') {
        const firstTab = document.querySelector('.tabs a:first-of-type');

        if (firstTab) {
            const firstPanel = document.querySelector(firstTab.getAttribute('href'));
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

function init() {
    setupGlobals();
}

export { init };