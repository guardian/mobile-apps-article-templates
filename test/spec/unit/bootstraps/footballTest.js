define([
    'squire'
], function (
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/bootstraps/football', function () {
        var football,
            container,
            sandbox;

        var youtubeMock;
            
        beforeEach(function (done) {
            var injector = new Squire();
            
            sandbox = sinon.sandbox.create();

            youtubeMock = {
                init: sandbox.spy()
            };

            container = document.createElement('div');
            container.id = 'container';
            document.body.appendChild(container);
            
            window.applyNativeFunctionCall = sandbox.spy();
            
            injector
                .mock('modules/youtube', youtubeMock)
                .require(['ArticleTemplates/assets/js/bootstraps/football'], function (sut) {
                    football = sut;

                    done();
                });
        });

        afterEach(function () {
            document.body.removeChild(container);

            delete window.footballMatchInfo;
            delete window.footballMatchInfoFailed;
            delete window.footballGoal;
            delete window.footballStatus;
            delete window.applyNativeFunctionCall;

            sandbox.restore();
        });

        describe('init()', function () {
            it('sets up global functions', function () {
                football.init();

                expect(window.footballMatchInfo).to.not.be.undefined;
                expect(window.footballMatchInfoFailed).to.not.be.undefined;
                expect(window.footballGoal).to.not.be.undefined;
                expect(window.footballStatus).to.not.be.undefined;
                expect(window.applyNativeFunctionCall).to.have.been.calledWith('footballMatchInfo');
                expect(window.applyNativeFunctionCall).to.have.been.calledWith('footballMatchInfoFailed');
            });
        });

        describe('window.footballMatchInfo(html, replaceContent, homeTeam, awayTeam)', function () {
            var pieChart,
                statsPanel,
                html;

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
                expect(statsPanel.children.length).to.eql(2);
                expect(statsPanel.innerHTML).to.eql(html);

                expect(pieChart.getAttribute('preserveAspectRatio')).to.eql('xMinYMin slice');
                expect(pieChart.getAttribute('viewBox')).to.eql('0 0 250 250');
                expect(pieChart.firstChild.classList.contains('pie-chart__inner')).to.eql(true);
            });

            it('adds football match info and hides panel', function () {
                statsPanel.setAttribute('aria-selected', 'false');

                football.init();

                window.footballMatchInfo(html, null, 'liverpool', 'arsenal');

                expect(statsPanel.style.display).to.eql('none');
            });

            it('adds football match info and does not hide panel', function () {
                statsPanel.setAttribute('aria-selected', 'true');

                football.init();

                window.footballMatchInfo(html, null, 'liverpool', 'arsenal');

                expect(statsPanel.style.display).to.eql('block');
            });
        });

        describe('window.footballMatchInfoFailed()', function () {
            var infoTab,
                statsTab,
                infoPanel,
                statsPanel,
                buildTab = function(href, ariaSelected) {
                    var tab = document.createElement('a');

                    tab.href = href;
                    tab.setAttribute('aria-selected', ariaSelected);

                    return tab;
                };

            beforeEach(function () {
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
               football.init();

                window.footballMatchInfoFailed();

                expect(statsPanel.parentNode).to.be.falsy;
            });

            it('if stats panel tab selected switch selected tab to first tab and remove stats panel/tab', function () {
                football.init();

                expect(infoTab.getAttribute('aria-selected')).to.eql('false');
                expect(infoPanel.style.display).to.eql('none');

                window.footballMatchInfoFailed();

                expect(infoTab.getAttribute('aria-selected')).to.eql('true');
                expect(infoPanel.style.display).not.to.eql('none');
                expect(statsTab.parentNode).to.be.falsy;
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
                football.init();

                window.footballGoal('home', 1, '<p>Alan Shearer</p>', 3);

                expect(matchSummary.classList.contains('is-agg')).to.eql(true);
                expect(matchSummary.querySelector('.match-summary__home__score__label').innerHTML).to.eql(1 + ' <span class="match-summary__score__agg">' + 3 + '</span>');
            });

            it('update score if aggScore falsy', function () {
                football.init();

                window.footballGoal('home', 1, '<p>Alan Shearer</p>');

                expect(matchSummary.classList.contains('is-agg')).to.eql(false);
                expect(matchSummary.querySelector('.match-summary__home__score__label').innerHTML).to.eql(1 + ' <span class="match-summary__score__agg"></span>');
            });

            it('update match info scorer p tag', function () {
                matchSummary.innerHTML += '<div class="match-summary__home__info"><p>Peter Beardsley</p></div>';

                football.init();

                expect(matchSummary.querySelector('.match-summary__home__info').innerHTML).to.eql('<p>Peter Beardsley</p>');

                window.footballGoal('home', 1, '<p>Alan Shearer</p>');

                expect(matchSummary.querySelector('.match-summary__home__info').innerHTML).to.eql('<p>Alan Shearer</p>');
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

                football.init();

                window.footballStatus('yyy', 'hello world');

                expect(matchStatus.classList.contains('match-status')).to.eql(true);
                expect(matchStatus.classList.contains('match-status--yyy')).to.eql(true);
                expect(matchStatusTime.innerText).to.eql('hello world');
            });
        });
    });
});