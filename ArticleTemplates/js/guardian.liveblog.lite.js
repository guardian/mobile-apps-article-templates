
// Summary Truncator
$(window).load(function() {

	$(".live-summary-body").dotdotdot({
		after: ".live-summary-more"
	});

	$(".live-summary-more").click(function() {
		var content = $(".live-summary-body").triggerHandler("originalContent");
		$(".live-summary").html(content);
	});

});
