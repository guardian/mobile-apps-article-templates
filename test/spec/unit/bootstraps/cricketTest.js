define([
    'squire'
], function (
    Squire
) {
    'use strict';

    describe('ArticleTemplates/assets/js/bootstraps/cricket', function () {
        var cricket,
            container;
            
        beforeEach(function (done) {
            var injector = new Squire();

            container = document.createElement('div');
            container.id = 'container';
            document.body.appendChild(container);

            injector
                .require(['ArticleTemplates/assets/js/bootstraps/cricket'], function (sut) {
                    cricket = sut;
                    
                    done();
                });
        });

        afterEach(function () {
            document.body.removeChild(container);
        });

        describe('init()', function () {
            it('sets up global functions', function () {
                cricket.init();

                expect(window.newCricketData).to.not.be.undefined;
                expect(window.newCricketStatus).to.not.be.undefined;
                expect(window.cricketMatchInfoFailed).to.not.be.undefined;
            });
        });

        describe('window.newCricketData(newHeader, newScorecard)', function () {
            it('adds newCricketData to header and scorecard', function () {
                var newHeaderHTML = '<div id="newHeader"></div>';
                var newScorecardHTML = '<div id="newScorecard"></div>';
                var newHeader = document.createElement('div');
                var newScorecard = document.createElement('div');

                newHeader.id = 'cricket-header';
                newScorecard.id = 'cricket-scorecard';

                container.appendChild(newHeader);
                container.appendChild(newScorecard);

                cricket.init();

                expect(newHeader.querySelectorAll('#newHeader').length).to.eql(0);
                expect(newScorecard.querySelectorAll('#newScorecard').length).to.eql(0);

                window.newCricketData(newHeaderHTML, newScorecardHTML);

                expect(newHeader.querySelectorAll('#newHeader').length).to.eql(1);
                expect(newScorecard.querySelectorAll('#newScorecard').length).to.eql(1);
            });
        });

        describe('window.newCricketStatus(matchStatus)', function () {
            it('remove pre-match class from cricketWrapper', function () {
                var matchStatus = 'xxx';
                var cricketWrapper = document.createElement('div');

                cricketWrapper.classList.add('cricket');
                cricketWrapper.classList.add('cricket--pre-match');

                container.appendChild(cricketWrapper);

                cricket.init();

                window.newCricketStatus(matchStatus);

                expect(cricketWrapper.classList.contains('cricket--pre-match')).to.eql(false);
            });

            it('add pre-match class to cricketWrapper', function () {
               
                var matchStatus = 'pre-match';
                var cricketWrapper = document.createElement('div');

                cricketWrapper.classList.add('cricket');

                container.appendChild(cricketWrapper);

                cricket.init();

                window.newCricketStatus(matchStatus);

                expect(cricketWrapper.classList.contains('cricket--pre-match')).to.eql(true);
            });
        });

        describe('window.cricketMatchInfoFailed()', function () {
            it('removes elements on cricketMatchInfoFailed', function () {
                var newHeader = document.createElement('div');
                var newScorecard = document.createElement('div');
                var cricketTabStats = document.createElement('a');
                var cricketTabPanelStats = document.createElement('div');

                newHeader.id = 'cricket-header';
                newScorecard.id = 'cricket-scorecard';
                cricketTabStats.id = 'cricket__tab--stats';
                cricketTabPanelStats.id = 'cricket__tabpanel--stats';

                container.appendChild(newHeader);
                container.appendChild(newScorecard);
                container.appendChild(cricketTabStats);
                container.appendChild(cricketTabPanelStats);

                cricket.init();

                expect(container.querySelectorAll('#cricket-header').length).to.eql(1);
                expect(container.querySelectorAll('#cricket-scorecard').length).to.eql(1);
                expect(container.querySelectorAll('#cricket__tab--stats').length).to.eql(1);
                expect(container.querySelectorAll('#cricket__tabpanel--stats').length).to.eql(1);

                window.cricketMatchInfoFailed();

                expect(container.querySelectorAll('#cricket-header').length).to.eql(0);
                expect(container.querySelectorAll('#cricket-scorecard').length).to.eql(0);
                expect(container.querySelectorAll('#cricket__tab--stats').length).to.eql(0);
                expect(container.querySelectorAll('#cricket__tabpanel--stats').length).to.eql(0);
            });

            it('switches to first tab if stats panel selected', function () {
                var otherTab = document.createElement('a');
                var otherPanel = document.createElement('div');
                var cricketTabStats = document.createElement('a');
                var cricketTabPanelStats = document.createElement('div');

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

                cricket.init();

                window.cricketMatchInfoFailed();

                expect(otherTab.getAttribute('aria-selected')).to.eql('true');
                expect(otherPanel.style.display).to.not.eql('none');
            });
        });
    });
});