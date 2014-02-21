/* Comment Reply Formatting */

	function commentsReplyFormatting() {
	
		$(".comment").each(function() {
		
			if ($(this).hasClass("checked") == false) {
				if ($(this).hasClass("is-response")) {
					counter++;
					if (counter == 4 ) {
						$(this).prev().children(".discussion__body").append("<div class='comments__view-more'><span class='icon'>&#xe002;</span> View more replies</div>");
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
		
		$(".comment .comments__view-more").click(function() {
			$(this).hide();
			$(this).closest(".comment").nextAll(".comment").each(function() {
				if ($(this).hasClass("is-response")) {
					$(this).slideDown("slow");
				} else {
					return false;
				}
			});
		});
        
        $(".comment.visible").click(function() {
        	
            if ($(this).hasClass("comments-open") == false) {
                $(".comments-open").find(".discussion__options").slideToggle();
                $(".comments-open").removeClass("comments-open");
            }
                                
            $(this).toggleClass("comments-open").find(".discussion__options").slideToggle();
            
        });
        
        $('.comment a, .comments__view-more, .discussion__reply, .discussion__recommend').click(function(evt) {
        	evt.stopPropagation();
		});

	};
	
	commentsReplyFormatting();


/* Inserts */

    function commentsInserter(html) {
       	if (! html) {
	  		$(".comments__empty").show();
	  		$(".ccomments__loading).hide();
    	} else {
		    $(html).appendTo(".article__body--comments");	
    	}
    	
    	$(".ccomments__loading).appendTo(".article__body--comments");	
    	
    };
    
    function commentsFailed() {
		$(".ccomments__loading).hide();
		$(".comments__failed").show();
		$("#comments").addClass("comments-has-failed");
    }
 
	function commentsEnd() {
		$(".ccomments__loading).remove();
	}
	
	function commentsRecommendIncrease(id, number) {
		console.log(number);
		var target = "#" + id + " .discussion__recommend";
		$(target).addClass("increase");
		$(target).children(".discussion__recommend__count").text(number);
	}
	
	function commentsRecommendDecrease(id, number) {
		var target = "#" + id + " .discussion__recommend";
		$(target).removeClass("increase");
		$(target).children(".discussion__recommend__count").text(number);
	}
	
	function scrollToComments() {
		window.location.href="#module-comments";
	}
