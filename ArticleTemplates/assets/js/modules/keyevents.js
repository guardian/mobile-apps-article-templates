/*$(document).ready(function() {
    $(".FAB").click(function() {
        $(".key__events").animate({
            height: "toggle",
            opacity: "toggle"
        }, "slow");
        $(".key__events").toggleClass("close open")
    });
});*/

$(document).ready(function() {
    $(".FAB").click(function() {
	    
	    var len = $(".key__events .key__events--list ul li").length +1;
	    console.log(len);
	    for(i=0; i<len; i++){
		  var delay = i * 200 + 1000;
		  console.log(delay);  
		  $(".key__events .key__events--list ul li:nth-child(" + i +")").delay(delay).fadeToggle();
	    }	   
		$(".FAB").toggleClass("close");
		$(".key__events").delay(1000).slideToggle();   
    });
});

