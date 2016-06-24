/*global define */
define([
    'modules/$',
    'bonzo'
], function (
    $,
    bonzo
) {
    'use strict';

    function dayOfWeek(day) {
        return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
    }

    function monthAbbr(month) {
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month];
    }

    function pad(n) {
        return n < 10 ? '0' + n : n;
    }

    function ampm(n) {
        return n < 12 ? 'am' : 'pm';
    }

    function twelveHourClock(hours) {
        return hours > 12 ? hours - 12 : hours;
    }

    function isToday(date) {
        var today = new Date();
        return (date.toDateString() === today.toDateString());
    }

    function isWithin24Hours(date) {
        var today = new Date();
        return (date.valueOf() > today.valueOf() - (24 * 60 * 60 * 1000));
    }

    function isWithinPastWeek(date) {
        var daysAgo = new Date().valueOf() - (7 * 24 * 60 * 60 * 1000);
        return date.valueOf() >= daysAgo;
    }

    function isWithinPastYear(date) {
        var weeksAgo = new Date().valueOf() - (52 * 7 * 24 * 60 * 60 * 1000);
        return date.valueOf() >= weeksAgo;
    }

    function isValidDate(date) {
        if (Object.prototype.toString.call(date) !== "[object Date]") {
            return false;
        }
        return !isNaN(date.getTime());
    }

    function withTime(date) {
        return ', ' + twelveHourClock(date.getHours()) + ':' + pad(date.getMinutes()) + ampm(date.getHours());
    }

    function makeRelativeDate(epoch, opts) {
        var then = new Date(Number(epoch)),
            now = new Date(),
            delta;

        opts = opts || {};

        if (!isValidDate(then)) {
            return false;
        }

        delta = parseInt((now.getTime() - then) / 1000, 10);

        if (delta < 0) {
            return false;

        } else if (delta < 55) {
            return delta + 's';

        } else if (delta < (55 * 60)) {
            var minutesAgo = Math.round(delta / 60, 10);
            if (minutesAgo == 1) {
                return 'Now';
            } else {
                return (minutesAgo) + 'm ago';
            }

        } else if (isToday(then) || (isWithin24Hours(then) && opts.format === 'short')) {
            var hoursAgo = Math.round(delta / 3600);
            return (hoursAgo) + 'h ago';

        } else if (isWithinPastWeek(then)) {
            var daysAgo = Math.round(delta / 3600 / 24);
            return (daysAgo) + 'd ago';

        } else if (isWithinPastYear(then)) {
            var weeksAgo = Math.round(delta / 3600 / 24 / 7);
            return (weeksAgo) + 'w ago';

        } else {
            var yearsAgo = Math.round(delta / 3600 / 24 / 7 / 52);
            return (yearsAgo) + 'y ago';
        }
    }

    function replaceValidTimestamps(selector, attr) {
        $(selector + '[' + attr + ']').each(function (el) {
            var $el = bonzo(el),
                datetime = new Date($el.attr(attr)),
                relativeDate = makeRelativeDate(datetime.getTime());

            if (relativeDate) {
                // If we find .timestamp__text (facia), use that instead
                var targetEl = $el[0].getElementsByClassName('timestamp__text')[0] || $el[0];

                if (!targetEl.getAttribute('title')) {
                    targetEl.setAttribute('title', bonzo(targetEl).text());
                }
                targetEl.innerHTML = relativeDate;
            }
        });
    }

    function init(selector, attr) {
        replaceValidTimestamps(selector, attr);
    }

    return {
        init: init
    };

});
