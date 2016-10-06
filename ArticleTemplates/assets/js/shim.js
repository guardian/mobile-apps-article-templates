(function() {
    'use strict';

    var nativeFunctionCalls = [
        'articleCommentsInserter',
        'articleCardsInserter',
        'articleCardsFailed',
        'articleTagInserter',
        'articleOutbrainInserter',
        'audioBackground',
        'superAudioSlider',
        'audioPlay',
        'audioStop',
        'commentsFailed',
        'articleCommentsFailed',
        'commentsClosed',
        'commentsOpen',
        'showMoreTags',
        'commentsReplyFormatting',
        'footballGoal',
        'footballStatus',
        'footballMatchInfo',
        'footballMatchInfoFailed',
        'liveblogDeleteBlock',
        'liveblogNewBlock',
        'liveblogUpdateBlock',
        'liveblogNewKeyEvent',
        'getMpuPosCallback',
        'initMpuPoller',
        'videoPositioning',
        'getArticleHeight',
        'injectInlineArticleMembershipCreative'
    ];

    function init(opts) {
        GU.opts = opts;

        if (!GU.opts.skipStyle) {
            loadCss();
        }

        catchNativeFunctionCalls();

        window.applyNativeFunctionCall = applyNativeFunctionCall;

        if (document.readyState === 'complete') {
            kickOff();
        } else {
            window.addEventListener('DOMContentLoaded', kickOff);
        }
    }

    function loadCss() {
        var url = 'assets/css/style-async.css',
            basePath = GU.opts.templatesDirectory,
            link = document.createElement('link');

        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = basePath + url;

        document.getElementsByTagName('head')[0].appendChild(link);
    }

    function kickOff() {
        window.requestAnimationFrame(addScript);
    }
    
    function addScript() {
        var script = document.createElement('script'),
            templatePath = GU.opts.templatesDirectory;

        script.setAttribute('src', templatePath + 'assets/build/components/require.js');
        script.setAttribute('id', 'gu');
        script.setAttribute('data-js-dir', templatePath + 'assets/build');
        script.setAttribute('data-main', templatePath + 'assets/build/main.js');
        script.async = true;

        document.head.appendChild(script);
    }

    function catchNativeFunctionCalls() {
        Array.prototype.forEach.call(nativeFunctionCalls, setNativeFunctionCall);
    }
    
    function setNativeFunctionCall(name) {
        var queue;

        // Create a function to catch early calls
        window[name] = function() {
            // Create or get the queue for this function
            queue = name + 'Queue';

            window[queue] = window[queue] || [];
            // Store arguments for each call so
            // true function can apply these when ready
            window[queue].push(arguments);
        };
    }

    function applyNativeFunctionCall(name) {
        var queue = window[name + 'Queue'];

        if (queue) {
            Array.prototype.forEach.call(queue, function(item) {
                window[name].apply(this, item);
            });
        }
    }

    function shimRequestAnimationFrame() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];

        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
                window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function (callback) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() {
                        callback(currTime + timeToCall);
                    },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }

        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
        }
    }

    GU.Bootstrap = {
        init: init
    };

    shimRequestAnimationFrame();
}());