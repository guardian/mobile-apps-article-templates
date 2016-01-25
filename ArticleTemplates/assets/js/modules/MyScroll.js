// Define the base / core Model class.
define(
    function() {
        "use strict";

        function MyScroll(elem, options) {
            this.ancestor = IScroll;
            this.scrollInProgress = false;
            this.ancestor.apply(this, arguments);
        }

        MyScroll.prototype = Object.create(IScroll.prototype);

        // MyScroll.prototype._start = function(evt, takeControlFromNative) {
        MyScroll.prototype._start = function(evt, startScroll) {
            console.log("START");

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
                var absDx,
                    absDy,
                    origEvent = evt;

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

        return (MyScroll);
    }
);