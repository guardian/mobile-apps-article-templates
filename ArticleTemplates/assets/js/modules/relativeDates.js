function isToday(date) {
    const today = new Date();

    return (date.toDateString() === today.toDateString());
}

function isWithin24Hours(date) {
    const today = new Date();

    return (date.valueOf() > (today.valueOf() - (24 * 60 * 60 * 1000)));
}

function isWithinPastWeek(date) {
    const daysAgo = new Date().valueOf() - (7 * 24 * 60 * 60 * 1000);
    return date.valueOf() >= daysAgo;
}

function isWithinPastYear(date) {
    const weeksAgo = new Date().valueOf() - (52 * 7 * 24 * 60 * 60 * 1000);
    return date.valueOf() >= weeksAgo;
}

function isValidDate(date) {
    if (Object.prototype.toString.call(date) !== '[object Date]') {
        return false;
    }
    return !Number.isNaN(date.getTime());
}

function makeRelativeDate(epoch) {
    let then = new Date(Number(epoch)),
        now = new Date(),
        delta;

    if (!isValidDate(then)) {
        return false;
    }

    delta = parseInt((now.getTime() - then) / 1000, 10);

    if (delta < 0) {
        return false;
    } else if (delta < 55) {
        return `${delta}s`;
    } else if (delta < (55 * 60)) {
        const minutesAgo = Math.round(delta / 60, 10);

        if (minutesAgo === 1) {
            return 'Now';
        }
        return `${minutesAgo}m ago`;
    } else if (isToday(then) || isWithin24Hours(then)) {
        const hoursAgo = Math.round(delta / 3600);

        return `${hoursAgo}h ago`;
    } else if (isWithinPastWeek(then)) {
        const daysAgo = Math.round(delta / 3600 / 24);

        return `${daysAgo}d ago`;
    } else if (isWithinPastYear(then)) {
        const weeksAgo = Math.round(delta / 3600 / 24 / 7);

        return `${weeksAgo}w ago`;
    }
    const yearsAgo = Math.round(delta / 3600 / 24 / 7 / 52);

    return `${yearsAgo}y ago`;
}

function replaceValidTimestamps(selector, attr) {
    let datetime,
        elem,
        elems,
        i,
        relativeDate,
        targetEl;

    elems = document.querySelectorAll(`${selector}[${attr}]`);

    for (i = 0; i < elems.length; i++) {
        elem = elems[i];
        datetime = new Date(elem.getAttribute(attr));
        relativeDate = makeRelativeDate(datetime.getTime());

        if (relativeDate) {
            targetEl = elem.getElementsByClassName('timestamp__text')[0] || elem;

            if (!targetEl.getAttribute('title')) {
                targetEl.setAttribute('title', targetEl.innerText);
            }

            targetEl.innerHTML = relativeDate;
        }
    }
}

function init(selector, attr) {
    replaceValidTimestamps(selector, attr);
}

export { init };
