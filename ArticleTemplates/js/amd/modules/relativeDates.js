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

    function isYesterday(relative) {
        var today = new Date(),
            yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        return (relative.toDateString() === yesterday.toDateString());
    }

    function isWithinPastWeek(date) {
        var weekAgo = new Date().valueOf() - (7 * 24 * 60 * 60 * 1000);
        return date.valueOf() >= weekAgo;
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
            return (Math.round(delta / 60, 10)) + ' minutes ago';

        } else if (isToday(then) || (isWithin24Hours(then) && opts.format === 'short')) {
            return (Math.round(delta / 3600)) + ' hours ago';

        } else if (isWithinPastWeek(then) && opts.format === 'short') {
            return (Math.round(delta / 3600 / 24)) + ' days ago';

        } else if (isYesterday(then)) { // yesterday
            return 'Yesterday' + withTime(then);

        } else if (delta < 5 * 24 * 60 * 60) { // less than 5 days
            return [dayOfWeek(then.getDay()), then.getDate(), monthAbbr(then.getMonth()), then.getFullYear()].join(' ') +
                   (opts.showTime ? withTime(then) : '');

        } else {
            return [then.getDate(), monthAbbr(then.getMonth()), then.getFullYear()].join(' ') +
                   (opts.showTime ? withTime(then) : '');

        }
    }

    function replaceValidTimestamps(selector, attr) {
        $(selector + '[' + attr + ']').each(function (el) {
            var $el = bonzo(el),
                datetime = new Date($el.attr(attr)),
                relativeDate = makeRelativeDate(datetime.getTime());

            if (relativeDate) {
                // If we find .timestamp__text (facia), use that instead
                var targetEl = $el[0].querySelector('.timestamp__text') || $el[0];

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
