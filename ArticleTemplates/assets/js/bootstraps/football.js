import { svg, layout, select } from 'd3';
import { init as initYoutube } from 'modules/youtube';
import { getElemsFromHTML } from 'modules/util';

function footballChart(homeTeam, awayTeam) {
    const pieChart = document.getElementsByClassName('pie-chart--possession')[0];

    const data = [
        [awayTeam, (pieChart && pieChart.getAttribute('data-away')) || null, 'away'],
        [homeTeam, (pieChart && pieChart.getAttribute('data-home')) || null, 'home']
    ];

    const width = 250;
    const height = 250;
    const radius = Math.min(height, width) / 2;

    const arc = svg.arc()
        .outerRadius(radius)
        .innerRadius(radius / 3);

    const pie = layout.pie()
        .sort(null)
        .value(d => d[1]);

    const // Init d3 chart
    vis = select('.pie-chart')
        .attr('preserveAspectRatio', 'xMinYMin slice')
        .attr('viewBox', '0 0 250 250')
        .append('g')
        .attr('class', 'pie-chart__inner')
        .attr('transform', `translate(${width / 2},${width / 2})`);

    // Add percentage symbol to center
    vis.append('text')
        .attr('class', 'pie-chart__key')
        .text('%')
        .attr('transform', 'translate(-18,15)');

    // Background
    const backgroundData = [['null', 100]];

    const backgroundarc = svg.arc()
        .outerRadius(radius - 1)
        .innerRadius((radius / 3) + 1);

    vis.append('path')
        .data(pie(backgroundData))
        .attr('class', 'pie-chart__pie')
        .attr('d', backgroundarc);

    // Draw Segements
    const g = vis.selectAll('.pie-chart__segment')
        .data(pie(data))
        .enter().append('g')
        .attr('class', 'pie-chart__segment');

    g.append('path')
        .attr('class', d => `pie-chart__segment-arc pie-chart__segment-arc--${d.data[2]}`)
        .attr('d', arc);

    // Add Text Labels
    const tblock = vis.selectAll('.pie-chart__label')
        .data(pie(data))
        .enter().append('foreignObject')
        .attr('class', d => `pie-chart__label pie-chart__label--${d.data[2]}`)
        .attr('width', 75)
        .attr('height', 50)
        .attr('text-anchor', 'middle')
        .attr('transform', d => {
            d.innerRadius = 0;
            d.outerRadius = radius;
            let textpoint = arc.centroid(d);
            textpoint = [textpoint[0] - 35, textpoint[1] - 25];
            return `translate(${textpoint})`;
        });

    tblock.append('xhtml:div')
        .attr('class', 'pie-chart__label-text')
        .attr('width', '50')
        .attr('x', 0)
        .attr('dy', '1.2em')
        .text(d => d.data[0]);

    tblock.append('xhtml:div')
        .attr('class', 'pie-chart__label-value')
        .attr('x', 0)
        .attr('dy', '1.2em')
        .text(d => d.data[1]);
}

function footballGoal(side, newScore, scorerHtml, aggScore) {
    let i;
    let matchSummary;
    const matchSummarySide = document.getElementsByClassName(`match-summary__${side}__score__label`)[0];
    const matchSummaryParagraphs = document.querySelectorAll(`.match-summary__${side}__info p`);
    const matchSummaryInfo = document.getElementsByClassName(`match-summary__${side}__info`)[0];

    if (aggScore) {
        matchSummary = document.getElementsByClassName('match-summary')[0];

        if (matchSummary) {
            matchSummary.classList.add('is-agg');
        }

        if (matchSummarySide) {
            matchSummarySide.innerHTML = `${newScore} <span class="match-summary__score__agg">${aggScore}</span>`;
        }
    } else if (matchSummarySide) {
        matchSummarySide.innerHTML = `${newScore} <span class="match-summary__score__agg"></span>`;
    }

    for (i = 0; i < matchSummaryParagraphs.length; i++) {
        matchSummaryParagraphs[i].parentNode.removeChild(matchSummaryParagraphs[i]);
    }

    if (matchSummaryInfo) {
        matchSummaryInfo.innerHTML = matchSummaryInfo.innerHTML + scorerHtml;
    }
}

function footballStatus(className, label) {
    let i;
    let matchStatus;
    let matchTime;

    if (className !== '(null)' && label !== '(null)') {
        matchStatus = document.getElementsByClassName('match-status')[0];

        if (matchStatus) {
            for (i = matchStatus.classList.length; i > 0; i--) {
                if (matchStatus.classList[i-1].includes('match-status--')) {
                    matchStatus.classList.remove(matchStatus.classList[i]);
                }
            }

            matchStatus.classList.add(`match-status--${className}`);
            matchTime = document.getElementsByClassName('match-status__time')[0];

            if (matchTime) {
                matchTime.innerText = label;
            }
        }
    }
}

function footballMatchInfo(html, replaceContent, homeTeam, awayTeam) {
    let elemsToAppend;
    const footballStatsPanel = document.getElementById('football__tabpanel--stats');
    let i;

    while (footballStatsPanel.firstChild) {
        footballStatsPanel.removeChild(footballStatsPanel.firstChild);
    }

    elemsToAppend = getElemsFromHTML(html);

    for (i = 0; i < elemsToAppend.length; i++) {
        footballStatsPanel.appendChild(elemsToAppend[i]);
    }

    footballChart(homeTeam, awayTeam);

    if (document.querySelectorAll('[aria-selected="true"]').length === 0) {
        footballStatsPanel.style.display = 'none';
    }
}

function footballMatchInfoFailed() {
    let tabToShow;
    let panelToShow;
    const footballStatsPanel = document.getElementById('football__tabpanel--stats');
    const footballStatsTab = document.querySelector('.tabs [href="#football__tabpanel--stats"]');

    footballStatsPanel.parentNode.removeChild(footballStatsPanel);

    if (footballStatsTab) {
        if (footballStatsTab.getAttribute('aria-selected') === 'true') {
            tabToShow = document.querySelector('.tabs a:first-of-type');

            if (tabToShow) {
                tabToShow.setAttribute('aria-selected', 'true');

                panelToShow = document.querySelector(tabToShow.getAttribute('href'));

                if (panelToShow) {
                    panelToShow.style.display = 'block';
                }
            }
        }
        footballStatsTab.classList.add('unavailable');
        footballStatsTab.addEventListener('touchstart', e => {
            e.preventDefault();
            e.stopPropagation();
        });
    }
}

function setupGlobals() {
    // Global function to handle football, called by native code
    window.footballMatchInfo = footballMatchInfo;
    window.footballMatchInfoFailed = footballMatchInfoFailed;
    window.footballGoal = footballGoal;
    window.footballStatus = footballStatus;

    window.applyNativeFunctionCall('footballMatchInfo');
    window.applyNativeFunctionCall('footballMatchInfoFailed');
}

function init() {
    setupGlobals();
    initYoutube();
}

export { init };