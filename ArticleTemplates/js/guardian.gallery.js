var windowWidth = window.innerWidth;
var imageHeight;
var padding;

if (windowWidth < 450 ) {
	imageHeight = 150; 
	padding = 4;
} else {
	imageHeight = 300;
	padding = 8;
}

$('.gallery__thumbnails').collagePlus({
        'targetHeight' : imageHeight,
        'padding' : padding
    });

$(window).resize(function() {
    $('.gallery__thumbnails').collagePlus({
        'targetHeight' : imageHeight,
        'padding' : padding
    });
});