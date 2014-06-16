var windowWidth = window.innerWidth;
var imageHeight;
var padding;

if (windowWidth < 450 ) {
	imageHeight = 150; 
} else {
	imageHeight = 300;
}

$('.gallery').collagePlus({
		'targetHeight' : imageHeight
	});

$(window).resize(function() {
	$('.gallery').removeAttr("style").collagePlus({
		'targetHeight' : imageHeight
	});
});