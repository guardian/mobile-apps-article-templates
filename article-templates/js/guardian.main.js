$(document).ready(function($) {
	
	/* Caption Correcter */
	
	$("figure").each(function() {
	
		figcaption = $(this).find("figcaption");
		
		if ($(figcaption).size() === 0 || $(figcaption).text() == "") {
         	$(figcaption).hide();
         	// $(this).css({"border-bottom" : "none"});
         }
		 
	});
		
	/* Interactives */
   		
});	

	function render(element, context, config, mediator) {
	
		var bootUrl = element.getAttribute('data-interactive');
		
		// The contract here is that the interactive module MUST return an object
		// with a method called 'boot'.
		
		require([bootUrl], function (interactive) {
		    // We pass the standard context and config here, but also inject the
		    // mediator so the external interactive can respond to our events.
		    interactive.boot(element, context, config, mediator);
		});
		
		return {
		    render: render
		};

	};
	
	$(window).load(function() {
		$("figure.interactive").each(function() {
		    DomNode = $(this).get(0);
		    render(DomNode, "body");
		});	 
	});

	/* Image Resizer */
	
	var imageClass;

	function imageSizer(width) {
		if (width < 301 ) {
			imageClass = "figure-inline";
		} else {
			imageClass = "figure-wide";
		}
	};
	
	function articleImageSizer() {
	
		$("figure > img").each(function() {
			imageClass = "";
			imageWidth = $(this).attr("width");
			
			if (typeof imageWidth === "undefined" ) {
				imageWidth = $(this).width();
				$(this).load(function() {
					imageSizer(imageWidth);
					$(this).parent().addClass(imageClass);
					if ($(this).parent().hasClass("figure-inline")) { $(this).width(imageWidth); };
					return false;
				});
			}
			
			imageSizer(imageWidth);
			$(this).parent().addClass(imageClass);
			if ($(this).parent().hasClass("figure-inline")) { $(this).parent().width(imageWidth); };
			
		});
	
	};
	
	articleImageSizer();

	/* Tag Function */
	
	function articleTagInserter(html) {
		$(html).appendTo("#tags ul");
	};
	
	/* Internal Link Scrolling */
	
	$('a[href^="#"]').on('click',function (e) {
	    e.preventDefault();

	    var target = this.hash,
	    $target = $(target);

	    $('html, body').stop().animate({
	        'scrollTop': $target.offset().top
	    }, 800, 'swing', function () {
	        window.location.hash = target;
	    });
	});
	
	/* Tabs */

	$("ul.tabs li").each(function(i) {
		
		tabGroup = $(this).attr("data-href");
		
		if (i > 0) {
		    $(tabGroup).hide();
		}
	
	});
	
	$(".tabs li").click(function() {
	
		classToHide = $(this).parent().find(".selected").attr("data-href");
		console.log(classToHide);
		classToShow = $(this).attr("data-href");
		console.log(classToShow);
		
		$(this).parent().find(".selected").removeClass("selected");
		$(this).addClass("selected");
		
		$(classToHide).hide();
		$(classToShow).show();
	
	});
	
	
	/* Equal Height Fix */
	
	function equalHeightFix(parent, children) {
		height = $(parent).height();
		$(children).css({"min-height": height});
	}
	
	/* Font Resizing */
	
	function fontResize(current, replacement) {
		$("body").removeClass(current).addClass(replacement);
	}

	/* Enable Fastclick */
	
	FastClick.attach(document.body);