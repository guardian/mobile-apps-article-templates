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
					[awayTeam, $(".football-chart").attr("data-away")],
					[homeTeam, $(".football-chart").attr("data-home")]
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
				vis = d3.select(".football-chart")
					.attr("height", height)
					.attr("width", width)
					.attr("preserveAspectRatio", "xMinYMin slice")
					.attr("viewBox", "0 0 250 250")
					.append("g")
					.attr("class", "football-chart__inner")
					.attr("transform", "translate(" + width / 2 + "," + width / 2 + ")");

				// Add percentage symbol to center
				vis.append("text")
					.attr("class", "arc-key")
					.text("%")
					.attr("transform", "translate(-18,15)");

				// Background
				var backgroundData = [["null", 100]],

				backgroundarc = d3.svg.arc()
					.outerRadius(radius - 1)
					.innerRadius((radius / 3) + 1);

				vis.append("path")
					.data(pie(backgroundData))
					.attr("d", backgroundarc)
					.attr("fill", "#333333");

				// Draw Segements
				var g = vis.selectAll(".arc")
					.data(pie(data))
					.enter().append("g")
					.attr("class", "arc");

				g.append("path")
					.attr("d", arc);
					

				// Add Text Labels
				var tblock = vis.selectAll(".foreignObject")
					.data(pie(data))
					.enter().append("foreignObject")
					.attr("class", "foreignObject")
					.attr("transform", function (d) {
						d.innerRadius = 0;
						d.outerRadius = radius;
						var textpoint = arc.centroid(d);
						textpoint = [textpoint[0] - 35, textpoint[1] - 25];
						return "translate(" + textpoint + ")";
					})
					.attr("width", 75)
					.attr("height", 50)
					.attr("text-anchor", "middle");
					
				tblock.append("xhtml:div")
					.attr("class", "arc-team")
					.attr("x", 0)
					.attr("width", "50")
					.attr("dy", "1.2em")
					.text(function (d) {
						return d.data[0];
					});

				tblock.append("xhtml:div")
					.attr("class", "arc-percent")
					.attr("x", 0)
					.attr("dy", "1.2em")
					.text(function (d) {
						return d.data[1];
					});
			},
			
			footballGoal: function() {
				// Allows the header to be updated when there is a goal
				window.footballGoal = function (side, newScore, scorerHtml) {
					$(".football-team-" + side + " .football__header__score h1").text(newScore);
					$(".football-team-" + side + " .football-info p").remove();
					$(".football-team-" + side + " .football-info").append(scorerHtml);
				};
			},
			
			footballStatus: function() {
				window.footballStatus = function(className, label) {
					$(".football-status").attr("class", "football-status").addClass(className);
					$(".football-status p").text(label);
				}
			},

			setupGlobals: function () {
				// Global function to handle football, called by native code
				window.footballMatchInfo = function (html, replaceContent, homeTeam, awayTeam) {
					$('.football-tabs-stats').empty();
					html = bonzo.create(html);
					$(html).appendTo('.football-tabs-stats');
					modules.footballChart(homeTeam, awayTeam);
					if (!$('ul.tabs [data-href=".football-tabs-stats"]').hasClass('selected')) {
						$('.football-tabs-stats').hide();
					}
				};
				window.footballMatchInfoFailed = function () {
					$(".football-tabs-stats").remove();
					if ($("ul.tabs [data-href='.football-tabs-stats']").hasClass("selected")) {
						$("ul.tabs li:first-of-type").addClass("selected");
						$($("ul.tabs .selected").attr("data-href")).show();
					}
					$("ul.tabs [data-href='.football-tabs-stats']").remove();
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
