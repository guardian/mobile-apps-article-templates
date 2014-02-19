// Insert Match Info

function footballMatchInfo(html, replaceContent, homeTeam, awayTeam) {
	if (replaceContent == 1) {
		$(".football-tabs-stats").empty();
	}
	$(html).appendTo(".football-tabs-stats");
	footballChart(homeTeam, awayTeam);
	if (!$("ul.tabs").find("[data-href='.football-tabs-stats']").hasClass("selected")) {
		$(".football-tabs-stats").hide();
	}
}

function footballMatchInfoFailed() {
	$(".football-tabs-stats").remove();
	if ($("ul.tabs").find("[data-href='.football-tabs-stats']").hasClass("selected")) {
		$("ul.tabs li:first-of-type").addClass("selected");
		$($("ul.tabs .selected").attr("data-href")).show();
	}
	$("ul.tabs").find("[data-href='.football-tabs-stats']").remove();
}

// Football Chart

function footballChart(homeTeam, awayTeam) {

	data = [[awayTeam, $(".football-chart").attr("data-away")], [homeTeam, $(".football-chart").attr("data-home")]];
	
	var width = 250,
		height = 250,
		radius = Math.min(height, width) / 2;
	
	var arc = d3.svg.arc()
	    .outerRadius(radius)
	    .innerRadius(radius / 3);
		
	var pie = d3.layout.pie()
	    .sort(null)
	    .value(function(d) { return d[1];});
	    
	    // Init d3 chart
	
	var vis = d3.select(".football-chart")
		.attr("height", height)
		.attr("width", width)
		.attr("preserveAspectRatio", "xMinYMin slice")
		.attr("viewBox", "0 0 250 250")
		.append("g")
	    .attr("transform", "translate(" + width / 2 + "," + width / 2 + ")");
	    
	    // Add percentage symbol to center
	
	    vis.append("text")
	    .attr("class", "arc-key")
		.text("%")
		.attr("transform", "translate(-18,15)");
		
		// Background
		
		backgroundData = [["null", 100]];
		
	var backgroundarc = d3.svg.arc()
		.outerRadius(radius - 1)
		.innerRadius((radius / 3)+1);
		
	var	background = vis.append("path")
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
		
	var tblock = g.append("foreignObject")
		.attr("class", "foreignObject")
		.attr("transform", function(d) {d.innerRadius = 0; d.outerRadius = radius;
			var textpoint = arc.centroid(d);
			textpoint = [textpoint[0], textpoint[1] - 25];
			return "translate(" + textpoint + ")";
		})
		.attr("x", "-38")
		.attr("width", 75)
		.attr("height", 50)
		.attr("text-anchor", "middle");
		
		tblock.append("xhtml:div")
		.attr("class", "arc-team")
		.attr("x", 0)
		.attr("dy", "1.2em")
		.attr("width", "50")
		.text(function(d) {return d["data"][0]});
		
		tblock.append("xhtml:div")
		.attr("class", "arc-percent")
		.attr("x", 0)
		.attr("dy", "1.2em")
		.text(function(d) { return d["data"][1]}); 
	
}