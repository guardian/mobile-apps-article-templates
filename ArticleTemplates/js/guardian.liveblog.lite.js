
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

// Timestamps
function liveblogTime() {
	if ( $(".live-tag").length > 0 ) {
		$("p.block-time").timeago();
	} else {
		$("p.block-time").each(function() {
			$(this).html($(this).attr("title"));
		});
	}

}

liveblogTime();
