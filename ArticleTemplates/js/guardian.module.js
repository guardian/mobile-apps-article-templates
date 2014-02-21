/* Insert Comments */

	function articleCommentsInserter(html) {
		
       	if (! html) {
	  		$(".comments__empty").show();
	  		$(".comments__loading").hide();
    	} else {
    		$(".comments__loading").hide();
		    $(html).appendTo("#comments");	
    	}
	
	};
	
	function articleCommentsFailed() {
		$(".comments__failed").show();
		$(".comments__loading").hide();
		$("#module-comments").addClass("comments-has-failed");
	}