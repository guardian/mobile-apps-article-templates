/* Pagination */

	function liveblogLoadMore(html) {
		$(".live-more-loading").hide();
		$(html).hide().appendTo(".liveblog-body").show().addClass("animated bounceIn");
		articleImageSizer();
		liveblogTime();
		liveblogAdvert();
	};
	
	function showLiveMore(show) {
		if (show) {
			$(".live-more").show();				
		} else {				
			$(".live-more").hide();				
		}
	};

	$(".live-more").click(function() {
		$(this).hide();
		$(".live-more-loading").show();
        window.location.href = 'x-gu://showmore';
	});

/* New Block updates */
	        
	var newBlockHtml = "";
	var updateCounter = 0;
	var liveblogStartPos = $(".live-container").offset();
	
	function liveblogNewBlock(html) {
	 
	    newBlockHtml = html + newBlockHtml;
	    
	    	if (liveblogStartPos.top > window.scrollY) {
				liveblogNewBlockDump();
	    	} else {
	        	if (updateCounter == 0) {
	    			updateCounter++;
	        		$(".live-updates-label").prepend(updateCounter);
	        		$(".live-updates").slideDown("slow");
	    		} else {
	    			updateCounter++;
	        		$(".live-updates-label").text(updateCounter + " new updates");
	    		}
	    	}
	};
	
	$(window).scroll(function() {
		if (liveblogStartPos.top > window.scrollY) {
			liveblogNewBlockDump();
		}
	});
	
	function liveblogNewBlockDump() {
		$(newBlockHtml).hide().prependTo(".liveblog-body").show().addClass("animated bounceIn");
		articleImageSizer();
		liveblogTime();
		newBlockHtml = "";
		updateCounter = 0;
		$(".live-updates").slideUp("slow", function() {
			$(".live-updates-label").text(" new update");
		});
	};
	
/* Remove Blocks */
	
	function liveblogDeleteBlock(blockID) {
		$("#" + blockID).remove();
	};
	
/* Summary Truncator */

	$(window).load(function() {
	
		$(".live-summary-body").dotdotdot({
			after: ".live-summary-more"
		});
	
		$(".live-summary-more").click(function() {
			var content = $(".live-summary-body").triggerHandler("originalContent");
			$(".live-summary").html(content);
		});
	
	});

	
/* Timestamps */
	
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