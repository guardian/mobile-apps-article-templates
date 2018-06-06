function init(register) {
    register('resize', function(specs, ret, iframe) {
        return resize(specs, iframe);
    });
}

function resize(specs, iframe) {
    if (!specs || !('height' in specs || 'width' in specs)) {
        return null;
    }

    if (specs.width) {
        iframe.style.width = normalise(specs.width);
    }

    if (specs.height) {
        iframe.style.height = normalise(specs.height);
    }
}

function normalise(length) {
    var lengthRegexp = /^(\d+)(%|px|em|ex|ch|rem|vh|vw|vmin|vmax)?/;
    var defaultUnit = 'px';
    var matches = String(length).match(lengthRegexp);
    if (!matches) {
        return null;
    }
    return matches[1] + (matches[2] === undefined ? defaultUnit : matches[2]);
}

export {
    init
};