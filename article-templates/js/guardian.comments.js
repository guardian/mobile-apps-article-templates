/* Comment Reply Formatting */

	function commentsReplyFormatting() {
	
		$(".comments-block").each(function() {
		
			if ($(this).hasClass("checked") == false) {
				if ($(this).hasClass("is-response")) {
					counter++;
					if (counter == 4 ) {
						$(this).prev().children(".comments-body").append("<div class='comments-view-more'><span class='icon'>&#xe002;</span> View more replies</div>");
					}
					if (counter > 3) {
						$(this).hide().addClass("comments-hidden");
					}
				} else {
					counter = 0;
				}
				$(this).addClass("checked");	
			};
			
		});
		
		$(".comments-block .comments-view-more").click(function() {
			$(this).hide();
			$(this).closest(".comments-block").nextAll(".comments-block").each(function() {
				if ($(this).hasClass("is-response")) {
					$(this).slideDown("slow");
				} else {
					return false;
				}
			});
		});
        
        $(".comments-block.visible").click(function() {
        	
            if ($(this).hasClass("comments-open") == false) {
                $(".comments-open").find(".comments-options").slideToggle();
                $(".comments-open").removeClass("comments-open");
            }
                                
            $(this).toggleClass("comments-open").find(".comments-options").slideToggle();
            
        });
        
        $('.comments-block a, .comments-view-more, .comments-options-reply, .comments-recommends-container').click(function(evt) {
        	evt.stopPropagation();
		});

	};
	
	commentsReplyFormatting();


/* Inserts */

    function commentsInserter(html) {
       	if (! html) {
	  		$(".comments-empty").show();
	  		$(".comments-loading").hide();
    	} else {
		    $(html).appendTo(".comments-container");	
    	}
    	
    	$(".comments-loading").appendTo(".comments-container");	
    	
    };
    
    function commentsFailed() {
		$(".comments-loading").hide();
		$(".comments-failed").show();
		$("#comments").addClass("comments-has-failed");
    }
 
	function commentsEnd() {
		$(".comments-loading").remove();
	}
	
	function commentsRecommendIncrease(id, number) {
		console.log(number);
		var target = "#" + id + " .comments-recommends-container";
		$(target).addClass("increase");
		$(target).children(".comments-recommends-count").text(number);
	}
	
	function commentsRecommendDecrease(id, number) {
		var target = "#" + id + " .comments-recommends-container";
		$(target).removeClass("increase");
		$(target).children(".comments-recommends-count").text(number);
	}
	
	function scrollToComments() {
		window.location.href="#module-comments";
	}
