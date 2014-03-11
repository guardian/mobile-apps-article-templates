
// Summary Truncator
$(window).load(function() {
	
	var summaryLocation = ".article__body--liveblog__pinned .block .block-elements";
	
	$(summaryLocation).dotdotdot({
		after: ".live-summary-more"
	});

	$(".live-summary-more").click(function() {
		var content = $(summaryLocation).triggerHandler("originalContent");
		$(summaryLocation).empty().append(content).addClass("expanded");
	});

});
