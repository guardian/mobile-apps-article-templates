// Define the base / core Model class.
define(
    function() {
        "use strict";

        function MyScroll(elem, options) {
            this.ancestor = IScroll;
            this.ancestor.apply(this, arguments);
        }

        MyScroll.prototype = Object.create(IScroll.prototype);

        MyScroll.prototype._start = function(evt, takeControlFromNative) {
            var origEvent = evt;

            evt = evt.touches ? evt.touches[0] : evt;

            // save position of start for later comparison
            this.startPos = {
                pageX: evt.pageX,
                pageY: evt.pageY
            };

            // if last panel
            if (this.isScrollAtEnd() && !takeControlFromNative) {
                this.handControlToNative();
            } else {
                this.takeControlFromNative();
            }

            this.ancestor.prototype._start.bind(this)(origEvent);
        };

        MyScroll.prototype._move = function(evt) {
            if (this.startPos) {
                var origEvent = evt;

                evt = evt.touches ? evt.touches[0] : evt;

                var absDx = Math.abs(evt.pageX - this.startPos.pageX),
                    absDy = Math.abs(evt.pageY - this.startPos.pageY);

                // if native later controlling scroll
                // and scroller in entire viewport
                // and user touch has moved 2 px or more
                // and user is vertical scrolling
                // and scrolling up 
                if (this.nativeScroll &&
                    MyScroll.isElementInViewport(this.wrapper) &&
                    Math.max(absDx, absDy) > 2 &&
                    absDy > absDx &&
                    evt.pageY > this.startPos.pageY) {

                    // take scroll back from native
                    this._start(evt, true);
                }

                this.ancestor.prototype._move.bind(this)(origEvent);
            }
        };

        MyScroll.prototype._end = function(evt) {
            if (this.startPos) {
                this.ancestor.prototype._end.bind(this)(evt);
                this.scrollDirection = null;
                this.startPos = null;
            }
        };

        MyScroll.prototype.handControlToNative = function() {
            this.nativeScroll = true;
            this.options.preventDefault = false;
            this.options.eventPassthrough = "vertical";
        };

        MyScroll.prototype.takeControlFromNative = function() {
            this.nativeScroll = false;
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