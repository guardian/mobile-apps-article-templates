/* Insert Comments */

	function articleCommentsInserter(html) {
		
       	if (! html) {
	  		$(".comments-empty").show();
	  		$(".comments-loading").hide();
    	} else {
    		$(".comments-loading").hide();
		    $(html).appendTo("#comments");	
    	}
	
	};
	
	function articleCommentsFailed() {
		$(".comments-failed").show();
		$(".comments-loading").hide();
		$("#module-comments").addClass("comments-has-failed");
	}