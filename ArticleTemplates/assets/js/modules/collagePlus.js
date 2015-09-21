/*jshint -W007 */
/*!
 *
 * collagePlus Plugin v0.3.2
 * https://github.com/ed-lea/jquery-collagePlus
 *
 * Copyright 2012, Ed Lea twitter.com/ed_lea
 *
 * built for http://qiip.me
 *
 * Rewritten for the Guardian
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 *
 */
/*global window,console,define */

define([
    'bean',
    'bonzo',
    'modules/$'
], function (
    bean,
    bonzo,
    $
) {
    'use strict';

    function applyModifications($obj, isNotLast, settings) {
        var css = {
            marginBottom            : settings.padding,
            marginRight             : (isNotLast) ? settings.padding : 0,
            display                 : settings.display,
            verticalAlign           : "bottom",
            overflow                : "hidden"
        };

        return $obj.parent().css(css);
    }

    /* jshint ignore:start */
    function resizeRow(obj, row, settings, rownum) {
        var imageExtras             = (settings.padding * (obj.length - 1)),
            albumWidthAdjusted      = settings.albumWidth - imageExtras,
            overPercent             = albumWidthAdjusted / (row - imageExtras),
            trackWidth              = imageExtras,
            lastRow                 = (row < settings.albumWidth ? true : false);

        for (var i = 0; i < obj.length; i++) {
            var $obj                = $(obj[i][0]),
                fw                  = Math.floor(obj[i][1] * overPercent),
                fh                  = Math.floor(obj[i][2] * overPercent),
                isNotLast           = !!(( i < obj.length - 1));

            if (settings.allowPartialLastRow === true && lastRow === true) {
                fw = obj[i][1];
                fh = obj[i][2];
            }

            trackWidth += fw;

            if (!isNotLast && trackWidth < settings.albumWidth) {
                if (settings.allowPartialLastRow === true && lastRow === true) {
                    fw = fw;
                } else {
                    fw = fw + (settings.albumWidth - trackWidth);
                }
            }

            $obj.css({
                width: fw,
                height: fh
            });

            applyModifications($obj, isNotLast, settings);
        }
    }
    /* jshint ignore:end */

    function init (selector, children, orientation) {
        // Set defaults based off window size
        var albumWidth;
        var imageHeight;
        var screenSpace = window.innerWidth;

        var padding = getComputedStyle(document.getElementsByClassName("gallery")[0]).getPropertyValue("padding-left");
            padding = Math.round(parseFloat(padding));

        // Gallery padding depenedent on available screen space
        var gp = screenSpace < 955 ? "11px 11px 0 11px" : "12px 12px 0 12px" ;

        // Pass correct width for settings
        switch (orientation) {
          case "portrait":
            albumWidth = 675;
            $(".gallery").css('padding', gp);
            break;
          case "landscape":
            albumWidth = 930;
            break;
          default:
            albumWidth = $(selector)[0].clientWidth - (padding * 2);
        }

        if (window.innerWidth < 450) {
            imageHeight = 150;
        } else {
            imageHeight = 300;
        }

        var settings = {
            "targetHeight"          : imageHeight,
            "albumWidth"            : albumWidth,
            "padding"               : padding,
            "images"                : $(children),
            "fadeSpeed"             : "fast",
            "display"               : "inline-block",
            "effect"                : "default",
            "direction"             : "vertical",
            "allowPartialLastRow"   : true
        };

        var row = 0,
            elements = [],
            rownum = 1;

        settings.images.each(function(scope, index) {

            var w = this.width,
                h = this.height;

            var nw = Math.ceil(w/h*settings.targetHeight),
                nh = Math.ceil(settings.targetHeight);

            elements.push([this, nw, nh]);

            row += nw + settings.padding;

            if (row > settings.albumWidth && elements.length !== 0) {
                resizeRow(elements, (row - settings.padding), settings, rownum);
                row = 0;
                elements = [];
                rownum += 1;
            }

            if (settings.images.length-1 == index && elements.length !== 0) {
                resizeRow(elements, row, settings, rownum);
                row = 0;
                elements = [];
                rownum += 1;
            }
        });
    }

    return {
        init: init
    };

});