import { init } from 'bootstraps/cricket';

describe('ArticleTemplates/assets/js/bootstraps/cricket', function () {
    let container;
        
    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'container';
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe('init()', function () {
        it('sets up global functions', function () {
            init();

            expect(window.newCricketData).toBeDefined();
            expect(window.newCricketStatus).toBeDefined();
            expect(window.cricketMatchInfoFailed).toBeDefined();
        });
    });

    describe('window.newCricketData(newHeader, newScorecard)', function () {
        it('adds newCricketData to header and scorecard', function () {
            let newHeaderHTML = '<div id="newHeader"></div>';
            let newScorecardHTML = '<div id="newScorecard"></div>';
            let newHeader = document.createElement('div');
            let newScorecard = document.createElement('div');

            newHeader.id = 'cricket-header';
            newScorecard.id = 'cricket-scorecard';

            container.appendChild(newHeader);
            container.appendChild(newScorecard);

            init();

            expect(newHeader.querySelectorAll('#newHeader').length).toEqual(0);
            expect(newScorecard.querySelectorAll('#newScorecard').length).toEqual(0);

            window.newCricketData(newHeaderHTML, newScorecardHTML);

            expect(newHeader.querySelectorAll('#newHeader').length).toEqual(1);
            expect(newScorecard.querySelectorAll('#newScorecard').length).toEqual(1);
        });
    });

    describe('window.newCricketStatus(matchStatus)', function () {
        it('remove pre-match class from cricketWrapper', function () {
            var matchStatus = 'xxx';
            var cricketWrapper = document.createElement('div');

            cricketWrapper.classList.add('cricket');
            cricketWrapper.classList.add('cricket--pre-match');

            container.appendChild(cricketWrapper);

            init();

            window.newCricketStatus(matchStatus);

            expect(cricketWrapper.classList.contains('cricket--pre-match')).toEqual(false);
        });

        it('add pre-match class to cricketWrapper', function () {   
            var matchStatus = 'pre-match';
            var cricketWrapper = document.createElement('div');

            cricketWrapper.classList.add('cricket');

            container.appendChild(cricketWrapper);

            init();

            window.newCricketStatus(matchStatus);

            expect(cricketWrapper.classList.contains('cricket--pre-match')).toEqual(true);
        });
    });

    describe('window.cricketMatchInfoFailed()', function () {
        it('removes elements on cricketMatchInfoFailed', function () {
            let newHeader = document.createElement('div');
            let newScorecard = document.createElement('div');
            let cricketTabStats = document.createElement('a');
            let cricketTabPanelStats = document.createElement('div');

            newHeader.id = 'cricket-header';
            newScorecard.id = 'cricket-scorecard';
            cricketTabStats.id = 'cricket__tab--stats';
            cricketTabPanelStats.id = 'cricket__tabpanel--stats';

            container.appendChild(newHeader);
            container.appendChild(newScorecard);
            container.appendChild(cricketTabStats);
            container.appendChild(cricketTabPanelStats);

            init();

            expect(container.querySelectorAll('#cricket-header').length).toEqual(1);
            expect(container.querySelectorAll('#cricket-scorecard').length).toEqual(1);
            expect(container.querySelectorAll('#cricket__tab--stats').length).toEqual(1);
            expect(container.querySelectorAll('#cricket__tabpanel--stats').length).toEqual(1);

            window.cricketMatchInfoFailed();

            expect(container.querySelectorAll('#cricket-header').length).toEqual(0);
            expect(container.querySelectorAll('#cricket-scorecard').length).toEqual(0);
            expect(container.querySelectorAll('#cricket__tab--stats').length).toEqual(0);
            expect(container.querySelectorAll('#cricket__tabpanel--stats').length).toEqual(0);
        });

        it('switches to first tab if stats panel selected', function () {
            let otherTab = document.createElement('a');
            let otherPanel = document.createElement('div');
            let cricketTabStats = document.createElement('a');
            let cricketTabPanelStats = document.createElement('div');

            otherTab.id = 'otherTab';
            otherTab.href = '#otherPanel';

            otherPanel.id = 'otherPanel';
            otherPanel.style.display = 'none';

            cricketTabStats.id = 'cricket__tab--stats';
            cricketTabStats.href = '#cricket__tabpanel--stats';
            cricketTabStats.setAttribute('aria-selected', 'true');

            cricketTabPanelStats.id = 'cricket__tabpanel--stats';

            container.classList.add('tabs');
            container.appendChild(otherTab);
            container.appendChild(otherPanel);
            container.appendChild(cricketTabStats);
            container.appendChild(cricketTabPanelStats);

            init();

            window.cricketMatchInfoFailed();

            expect(otherTab.getAttribute('aria-selected')).toEqual('true');
            expect(otherPanel.style.display).not.toEqual('none');
        });
    });
});
