// Define the base / core Model class.
define([
    'iscroll'
], function (
    IScroll
) {
    "use strict";

    function MyScroll(elem, options) {
        this.ancestor = IScroll;
        this.scrollInProgress = false;
        this.ancestor.apply(this, arguments);
    }

    MyScroll.prototype = Object.create(IScroll.prototype);

    MyScroll.prototype._start = function(evt, startScroll) {
        var origEvent = evt;

        evt = evt.touches ? evt.touches[0] : evt;

        // save position of start for later comparison
        this.startPos = {
            pageX: evt.pageX,
            pageY: evt.pageY
        };

        if (startScroll) {
            this.takeControlFromNative();
            this.scrollInProgress = true;
            this.ancestor.prototype._start.bind(this)(origEvent);
        }
    };

    MyScroll.prototype._move = function(evt) {
        if (this.startPos) {
            var currentPage = this.currentPage.pageY,
                currentTime,
                absDx,
                absDy,
                origEvent = evt;

            clearTimeout(this.moveTimeout);

            this.moveTimeout = setTimeout(this.handleFailedSwipe.bind(this, origEvent), 50);

            evt = evt.touches ? evt.touches[0] : evt;
            absDx = Math.abs(evt.pageX - this.startPos.pageX);
            absDy = Math.abs(evt.pageY - this.startPos.pageY);

            if (this.scrollInProgress) {
                this.ancestor.prototype._move.bind(this)(origEvent);
            } else {
                // if user is doing vertical swipe
                // and is not at scroller's end
                // or is at scroller's end but user is swiping up
                // then start scroll 
                if (absDy > absDx &&
                    (!this.isScrollAtEnd() || (MyScroll.isElementInViewport(this.wrapper) && evt.pageY > this.startPos.pageY))) {
                    this._start(origEvent, true);
                }    
            }
        }
    };

    MyScroll.prototype._end = function(evt) {
        if (this.startPos) {
            clearTimeout(this.moveTimeout);
            this.scrollInProgress = false;
            this.ancestor.prototype._end.bind(this)(evt);
            this.scrollDirection = null;
            this.startPos = null;
        }
    };

    MyScroll.prototype.takeControlFromNative = function() {
        this.options.preventDefault = true;
        this.options.eventPassthrough = null;
    };

    MyScroll.prototype.isScrollAtEnd = function() {
        return this.maxScrollY === this.y;
    };

    MyScroll.prototype.handleFailedSwipe = function(evt) {
        if (this.startPos) {
            var topRange = 50;

            // if last registered touch was an upward scroll
            // at the top of the screen
            // and there's a next page to scroll to
            // then scroll to next page
            if (evt.pageY < this.startPos.pageY &&
                evt.pageY < topRange &&
                this.pages[0][this.currentPage.pageY + 1]) {
                this.scrollTo(0, this.pages[0][this.currentPage.pageY + 1].y, 500);
            }
        }
    };

    MyScroll.isElementInViewport = function(el) {
        var top = el.offsetTop,
            left = el.offsetLeft,
            width = el.offsetWidth,
            height = el.offsetHeight;

        while (el.offsetParent) {
            el = el.offsetParent;
            top += el.offsetTop;
            left += el.offsetLeft;
        }

        return (
            top >= window.pageYOffset &&
            left >= window.pageXOffset &&
            (top + height) <= (window.pageYOffset + window.innerHeight) &&
            (left + width) <= (window.pageXOffset + window.innerWidth)
        );
    };

    return MyScroll;
});