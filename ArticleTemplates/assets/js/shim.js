/*global window */

/*
    Native code (mostly Android) attempts to call Javascript functions
    way too early. Most manipulate the DOM, so require DOMready at least,
    though most come through before DOMinteractive even.

    For the list of functions below, create an array to queue function calls and
    arguments which can be requested by respective modules later when the time
    is more appropriate.

    If both Android and IOS calls are delayed until DOMready, this would
    not be necessary.
*/

var nativeFunctionCalls = [
    'articleCommentsInserter',
    'articleCardsInserter',
    'articleTagInserter',
    'audioBackground',
    'superAudioSlider',
    'commentsFailed',
    'articleCommentsFailed',
    'commentsClosed',
    'commentsOpen',
    'commentsReplyFormatting',
    'footballMatchInfo',
    'footballMatchInfoFailed',
    'liveblogDeleteBlock',
    'liveblogNewBlock',
    'getMpuPosCallback'
];

Array.prototype.forEach.call(nativeFunctionCalls, function (name) {
    // Create a function to catch early calls
    window[name] = function () {
        // Create or get the queue for this function
        var queue = name + 'Queue';
        window[queue] = window[queue] || [];
        // Store arguments for each call so
        // true function can apply these when ready
        window[queue].push(arguments);
    };
});

var applyNativeFunctionCall = function (name) {
    var queue = window[name + 'Queue'];
    if (queue) {
        Array.prototype.forEach.call(queue, function (item) {
            window[name].apply(this, item);
        });
    }
};
