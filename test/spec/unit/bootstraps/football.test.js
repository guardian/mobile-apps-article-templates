import { init } from 'bootstraps/football';

jest.mock('modules/youtube', () => {
    return {
        init: jest.fn()
    };
});

describe('ArticleTemplates/assets/js/bootstraps/football', function () {
    let container;
        
    beforeEach(function () {
        container = document.createElement('div');
        container.id = 'container';
        document.body.appendChild(container);
        
        window.applyNativeFunctionCall = jest.fn();
    });

    afterEach(function () {
        document.body.removeChild(container);

        delete window.footballMatchInfo;
        delete window.footballMatchInfoFailed;
        delete window.footballGoal;
        delete window.footballStatus;
        delete window.applyNativeFunctionCall;
    });

    describe('init()', function () {
        it('sets up global functions', function () {
            init();

            expect(window.footballMatchInfo).toBeDefined();
            expect(window.footballMatchInfoFailed).toBeDefined();
            expect(window.footballGoal).toBeDefined();
            expect(window.footballStatus).toBeDefined();
            expect(window.applyNativeFunctionCall).toBeCalledWith('footballMatchInfo');
            expect(window.applyNativeFunctionCall).toBeCalledWith('footballMatchInfoFailed');
        });
    });

    describe('window.footballMatchInfo(html, replaceContent, homeTeam, awayTeam)', function () {
        let pieChart;
        let statsPanel;
        let html;

        beforeEach(function () {
            statsPanel = document.createElement('div');
            statsPanel.id = 'football__tabpanel--stats';
            statsPanel.innerHTML = '<p>test</p>';
            statsPanel.style.display = 'block';
            container.appendChild(statsPanel);

            pieChart = document.createElement('svg');
            pieChart.classList.add('pie-chart--possession');
            pieChart.classList.add('pie-chart');
            pieChart.dataset.away = 53;
            pieChart.dataset.home = 47;
            container.appendChild(pieChart);

            html = '<p>Hello World</p><p>Foo Bar</p>';
        });

        afterEach(function () {
            expect(statsPanel.children.length).toEqual(2);
            expect(statsPanel.innerHTML).toEqual(html);

            expect(pieChart.getAttribute('preserveAspectRatio')).toEqual('xMinYMin slice');
            expect(pieChart.getAttribute('viewBox')).toEqual('0 0 250 250');
            expect(pieChart.firstChild.classList.contains('pie-chart__inner')).toEqual(true);
        });

        it('adds football match info and hides panel', function () {
            statsPanel.setAttribute('aria-selected', 'false');

            init();

            window.footballMatchInfo(html, null, 'liverpool', 'arsenal');

            expect(statsPanel.style.display).toEqual('none');
        });

        it('adds football match info and does not hide panel', function () {
            statsPanel.setAttribute('aria-selected', 'true');

            init();

            window.footballMatchInfo(html, null, 'liverpool', 'arsenal');

            expect(statsPanel.style.display).toEqual('block');
        });
    });

    describe('window.footballMatchInfoFailed()', function () {
        let infoTab;
        let statsTab;
        let infoPanel;
        let statsPanel;
        const buildTab = function (href, ariaSelected) {
            var tab = document.createElement('a');

            tab.href = href;
            tab.setAttribute('aria-selected', ariaSelected);

            return tab;
        };

        beforeEach(() => {
            container.classList.add('tabs');

            infoPanel = document.createElement('div');
            infoPanel.id = 'football__tabpanel--info';
            infoPanel.style.display = 'none';
            container.appendChild(infoPanel);

            statsPanel = document.createElement('div');
            statsPanel.id = 'football__tabpanel--stats';
            container.appendChild(statsPanel);

            infoTab = buildTab('#football__tabpanel--info', false);
            container.appendChild(infoTab);

            statsTab = buildTab('#football__tabpanel--stats', true);
            container.appendChild(statsTab);
        });

        it('removes stats panel', function () {
            init();

            window.footballMatchInfoFailed();
            expect(statsPanel.parentNode).toBeFalsy();
        });

        it('if stats panel tab selected switch selected tab to first tab and remove stats panel/tab', function () {
            init();

            expect(infoTab.getAttribute('aria-selected')).toEqual('false');
            expect(infoPanel.style.display).toEqual('none');

            window.footballMatchInfoFailed();

            expect(infoTab.getAttribute('aria-selected')).toEqual('true');
            expect(infoPanel.style.display).not.toEqual('none');
        });
    });

    describe('window.footballGoal(side, newScore, scorerHtml, aggScore)', function () {
        var matchSummary;

        beforeEach(function () {
            matchSummary = document.createElement('div');
            matchSummary.classList.add('match-summary');

            matchSummary.innerHTML = '<div class="match-summary__home__score__label"></div>';

            container.appendChild(matchSummary);
        });

        it('update score if aggScore truthy', function () {
            init();

            window.footballGoal('home', 1, '<p>Alan Shearer</p>', 3);

            expect(matchSummary.classList.contains('is-agg')).toEqual(true);
            expect(matchSummary.querySelector('.match-summary__home__score__label').innerHTML).toEqual(1 + ' <span class="match-summary__score__agg">' + 3 + '</span>');
        });

        it('update score if aggScore falsy', function () {
            init();

            window.footballGoal('home', 1, '<p>Alan Shearer</p>');

            expect(matchSummary.classList.contains('is-agg')).toEqual(false);
            expect(matchSummary.querySelector('.match-summary__home__score__label').innerHTML).toEqual(1 + ' <span class="match-summary__score__agg"></span>');
        });

        it('update match info scorer p tag', function () {
            matchSummary.innerHTML += '<div class="match-summary__home__info"><p>Peter Beardsley</p></div>';

            init();

            expect(matchSummary.querySelector('.match-summary__home__info').innerHTML).toEqual('<p>Peter Beardsley</p>');

            window.footballGoal('home', 1, '<p>Alan Shearer</p>');

            expect(matchSummary.querySelector('.match-summary__home__info').innerHTML).toEqual('<p>Alan Shearer</p>');
        });
    });

    describe('window.footballStatus(className, label)', function () {
        it('clears old status and reapplies class before adding new status', function () {
            var matchStatus = document.createElement('div'),
                matchStatusTime = document.createElement('div');

            matchStatus.classList.add('match-status');
            matchStatus.classList.add('match-status--xxx');
            matchStatusTime.classList.add('match-status__time');

            container.appendChild(matchStatus);
            container.appendChild(matchStatusTime);

            init();

            window.footballStatus('yyy', 'hello world');

            expect(matchStatus.classList.contains('match-status')).toEqual(true);
            expect(matchStatus.classList.contains('match-status--yyy')).toEqual(true);
            expect(matchStatusTime.innerText).toEqual('hello world');
        });
    });
});
