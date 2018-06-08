import {
    svg,
    layout,
    select,
} from 'd3';
import { init as initYoutube } from 'modules/youtube';
import { getElemsFromHTML } from 'modules/util';

function footballChart(homeTeam, awayTeam) {
    let pieChart = document.getElementsByClassName('pie-chart--possession')[0],
        data = [
            [awayTeam, (pieChart && pieChart.getAttribute('data-away')) || null, 'away'],
            [homeTeam, (pieChart && pieChart.getAttribute('data-home')) || null, 'home'],
        ],
        width = 250,
        height = 250,
        radius = Math.min(height, width) / 2,

        arc = svg.arc()
            .outerRadius(radius)
            .innerRadius(radius / 3),

        pie = layout.pie()
            .sort(null)
            .value((d) => d[1]),

        // Init d3 chart
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
    let backgroundData = [['null', 100]],

        backgroundarc = svg.arc()
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
        .attr('class', (d) => `pie-chart__segment-arc pie-chart__segment-arc--${d.data[2]}`)
        .attr('d', arc);

    // Add Text Labels
    const tblock = vis.selectAll('.pie-chart__label')
        .data(pie(data))
        .enter().append('foreignObject')
        .attr('class', (d) => `pie-chart__label pie-chart__label--${d.data[2]}`)
        .attr('width', 75)
        .attr('height', 50)
        .attr('text-anchor', 'middle')
        .attr('transform', (d) => {
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
        .text((d) => d.data[0]);

    tblock.append('xhtml:div')
        .attr('class', 'pie-chart__label-value')
        .attr('x', 0)
        .attr('dy', '1.2em')
        .text((d) => d.data[1]);
}

function footballGoal(side, newScore, scorerHtml, aggScore) {
    let i,
        matchSummary,
        matchSummarySide = document.getElementsByClassName(`match-summary__${side}__score__label`)[0],
        matchSummaryParagraphs = document.querySelectorAll(`.match-summary__${side}__info p`),
        matchSummaryInfo = document.getElementsByClassName(`match-summary__${side}__info`)[0];

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
        matchSummaryInfo.innerHTML += scorerHtml;
    }
}

function footballStatus(className, label) {
    let i,
        matchStatus,
        matchTime;

    if (className !== '(null)' && label !== '(null)') {
        matchStatus = document.getElementsByClassName('match-status')[0];

        if (matchStatus) {
            for (i = matchStatus.classList.length; i > 0; i--) {
                if (matchStatus.classList[i - 1].indexOf('match-status--') !== -1) {
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
    let elemsToAppend,
        footballStatsPanel = document.getElementById('football__tabpanel--stats'),
        i;

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
    let tabToShow,
        panelToShow,
        footballStatsPanel = document.getElementById('football__tabpanel--stats'),
        footballStatsTab = document.querySelector('.tabs [href="#football__tabpanel--stats"]');

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

        footballStatsTab.parentNode.removeChild(footballStatsTab);
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
