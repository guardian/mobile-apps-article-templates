define([
    'modules/util'
],
function (
    util
) {
    'use strict';

    var initialised,
        galleryProps,
        galleryRows;

    var PROPS = {
            0 :{
                imagesPerRow: 3
            },
            650: {
                imagesPerRow: 4
            },
            1200: {
                imagesPerRow: 5
            }
        };

    function init() {
        if (!initialised) {
            initialised = true;

            buildGallery();

            window.addEventListener('resize', util.debounce(buildGallery, 100));
        }
    }

    function buildGallery() {
        setGalleryProps();
        addImagesToRows();
        addFlexClass();
    }

    function setGalleryProps() {
        var width;

        for (width in PROPS) {
            if(PROPS.hasOwnProperty(width)) {
                if (window.innerWidth > parseInt(width, 10)) {
                    galleryProps = PROPS[width];
                } else {
                    break;
                }
            }
        }
    }

    function addImagesToRows() {
        var i,
            images = document.body.getElementsByClassName('gallery__image-container'),
            rows = [
                []
            ];

        // loop through images and add to rows  
        for (i = images.length - 1; i >= 0; i--) {
            // if current row is full create new row 
            if (rows[0].length === galleryProps.imagesPerRow) {
                rows.unshift([]);
            }
            // add next image to front of new row
            rows[0].unshift(images[i]);
        }

        // if first row doesn't have enough images call moveImagesToRows
        if (rows.length > 1 && rows[0].length < (galleryProps.imagesPerRow - 1)) {
            moveImagesToRows(rows);
        }

        galleryRows = rows;
    }

    function moveImagesToRows(rows) {
        var i, j, offset;

        for (i = 0; i < rows.length; i++) {
            if (i === rows.length - 1) {
                while (rows[i].length < rows[i - 1].length) {
                    rows[i].push(rows[i - 1].pop());
                }
            } else {
                offset = (galleryProps.imagesPerRow - 1) - rows[i].length;

                if (offset > 0) {
                    for (j = 0; j < offset; j++) {
                        if (rows[i + 1]) {
                            rows[i].push(rows[i + 1].shift());
                        }
                    }
                }
            }
        }
    } 

    function addFlexClass() {
        var i, j;

        // for each row
        for (i = 0; i < galleryRows.length; i++) {
            // for each image in row
            for (j = 0; j < galleryRows[i].length; j++) {
                // remove flex class
                removeFlexClass(galleryRows[i][j]);
                // add new flex class
                galleryRows[i][j].classList.add('gallery__image-container--flex' + galleryRows[i].length);
            }
        }
    }

    function removeFlexClass(imageElem) {
        var i;

        // if imageElem has class name with "flex" in it then remove class
        for (i = 0; i < imageElem.classList.length; i++) {
            if (imageElem.classList[i].indexOf('flex') !== -1) {
                imageElem.classList.remove(imageElem.classList[i]);
            }
        }
    }

    return {
        init: init
    };
});