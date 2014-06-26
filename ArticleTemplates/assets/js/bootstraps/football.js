/*global window,console,define */
define([
    'bonzo',
    'd3',
    'modules/$'
], function (
    bonzo,
    d3,
    $
) {
    'use strict';

    var modules = {
        footballChart: function (homeTeam, awayTeam) {
            var data = [
                [awayTeam, $(".pie-chart--possession").attr("data-away"), "away"],
                [homeTeam, $(".pie-chart--possession").attr("data-home"), "home"]
            ],

            width = 250,
            height = 250,
            radius = Math.min(height, width) / 2,

            arc = d3.svg.arc()
                .outerRadius(radius)
                .innerRadius(radius / 3),

            pie = d3.layout.pie()
                .sort(null)
                .value(function (d) {
                    return d[1];
                }),

            // Init d3 chart
            vis = d3.select(".pie-chart")
                .attr("height", height)
                .attr("width", width)
                .attr("preserveAspectRatio", "xMinYMin slice")
                .attr("viewBox", "0 0 250 250")
                .append("g")
                .attr("class", "pie-chart__inner")
                .attr("transform", "translate(" + width / 2 + "," + width / 2 + ")");

            // Add percentage symbol to center
            vis.append("text")
                .attr("class", "pie-chart__key")
                .text("%")
                .attr("transform", "translate(-18,15)");

            // Background
            var backgroundData = [["null", 100]],

            backgroundarc = d3.svg.arc()
                .outerRadius(radius - 1)
                .innerRadius((radius / 3) + 1);

            vis.append("path")
                .data(pie(backgroundData))
                .attr("class", "pie-chart__pie")
                .attr("d", backgroundarc);

            // Draw Segements
            var g = vis.selectAll(".pie-chart__segment")
                .data(pie(data))
                .enter().append("g")
                .attr("class", "pie-chart__segment");
            
            g.append("path")
                .attr("class", function(d) {
                    return "pie-chart__segment-arc pie-chart__segment-arc--" + d.data[2];
                })
                .attr("d", arc);

            // Add Text Labels
            var tblock = vis.selectAll(".pie-chart__label")
                .data(pie(data))
                .enter().append("foreignObject")
                .attr("class", function(d) {
                    return "pie-chart__label pie-chart__label--" + d.data[2];
                })
                .attr("width", 75)
                .attr("height", 50)
                .attr("text-anchor", "middle")
                .attr("transform", function (d) {
                    d.innerRadius = 0;
                    d.outerRadius = radius;
                    var textpoint = arc.centroid(d);
                    textpoint = [textpoint[0] - 35, textpoint[1] - 25];
                    return "translate(" + textpoint + ")";
                });

            tblock.append("xhtml:div")
                .attr("class", "pie-chart__label-text")
                .attr("width", "50")
                .attr("x", 0)
                .attr("dy", "1.2em")
                .text(function (d) {
                    return d.data[0];
                });

            tblock.append("xhtml:div")
                .attr("class", "pie-chart__label-value")
                .attr("x", 0)
                .attr("dy", "1.2em")
                .text(function (d) {
                    return d.data[1];
                });
        },

        footballGoal: function() {
            // Allows the header to be updated when there is a goal
            window.footballGoal = function (side, newScore, scorerHtml, aggScore) {
                dodgy = false;
                if ((newScore === 0) && (scorerHtml === '') && !aggScore) {
                    // this could be a dodgy call from iOS
                    oldScore = $(".match-summary__" + side + "__score__label").html().substring(0, 1);
                    if ((oldScore === "1") || (oldScore === "2") || (oldScore === "3") || (oldScore === "4") || (oldScore === "5") || (oldScore === "6") || (oldScore === "7") || (oldScore === "8") || (oldScore === "9")) {
                        // this is most likely a dodgy call from iOS, the score shouldn't go from (for example) 2 to 0
                        dodgy = true;
                    }
                }
                if (!dodgy) {
                    if (aggScore) {
                        $(".match-summary").addClass("is-agg");
                        $(".match-summary__" + side + "__score__label").html(newScore + " <span class=\"match-summary__score__agg\">" + aggScore + "</span>");
                    } else {
                        $(".match-summary__" + side + "__score__label").html(newScore + " <span class=\"match-summary__score__agg\"></span>");
                    }
                    $(".match-summary__" + side + "__info p").remove();
                    $(".match-summary__" + side + "__info").append(scorerHtml);
                }
            };
        },

        footballStatus: function() {
            window.footballStatus = function(className, label) {
                // Clear old status and reapply class before adding new status
                if ((className !== '(null)') && (label !== '(null)')) {
                    $(".match-status").attr("class", "match-status").addClass("match-status--" + className);
                    $(".match-status__time").text(label);
                }
            }
        },

        setupGlobals: function () {
            // Global function to handle football, called by native code
            window.footballMatchInfo = function (html, replaceContent, homeTeam, awayTeam) {
                $('.football__tab--stats').empty();
                html = bonzo.create(html);
                $(html).appendTo('.football__tab--stats');
                modules.footballChart(homeTeam, awayTeam);
                if (!$('.tabs [data-href=".football-tabs-stats"]').hasClass('selected')) {
                    $('.football-tabs-stats').hide();
                }
            };
            window.footballMatchInfoFailed = function () {
                $(".football__tab--stats").remove();
                if ($(".tabs [data-href='.football__tab--stats']").hasClass("selected")) {
                    $(".tabs li:first-of-type").addClass("selected");
                    $($(".tabs .selected").attr("data-href")).show();
                }
                $(".tabs [data-href='.football__tab--stats']").remove();
            }
            window.applyNativeFunctionCall('footballMatchInfo');
            window.applyNativeFunctionCall('footballMatchInfoFailed');
        }
    },

    ready = function () {
        if (!this.initialised) {
            this.initialised = true;
            modules.setupGlobals();
            modules.footballGoal();
            modules.footballStatus();
            // console.info("Football ready");
        }
    };

    return {
        init: ready
    };
});