var windowWidth = window.innerWidth;
var imageHeight;

if (windowWidth < 450 ) {
	imageHeight = 150; 
} else {
	imageHeight = 300;
}

$('.gallery-thumbnails').collagePlus({
        'targetHeight' : imageHeight
    });

$(window).resize(function() {
    $('.gallery-thumbnails').collagePlus({
        'targetHeight' : imageHeight
    });
});