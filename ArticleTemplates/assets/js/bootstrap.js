(function() {
    'use strict';

    GU.bootstrap = {
        init: init
    };

    function init(opts) {
        var nativeFunctionCalls = [
            'articleCommentsInserter',
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
            'injectInlineArticleMembershipCreative',
            'getRelatedContentPosition',
            'setRelatedContentHeight'
        ],
        loadCss = function() {
            var url = 'assets/css/' + opts.asyncStylesFilename + '.css',
                basePath = GU.opts.templatesDirectory,
                link = document.createElement('link');

            link.type = 'text/css';
            link.rel = 'stylesheet';
            link.href = basePath + url;

            document.getElementsByTagName('head')[0].appendChild(link);
        },
        addScript = function() {
            var script = document.createElement('script'),
                templatePath = GU.opts.templatesDirectory;

            script.setAttribute('src', templatePath + 'assets/build/components/require.js');
            script.setAttribute('id', 'gu');
            script.setAttribute('data-js-dir', templatePath + 'assets/build');
            script.setAttribute('data-main', templatePath + 'assets/build/main.js');
            script.async = true;

            document.head.appendChild(script);
        },
        kickOff = function() {
            window.requestAnimationFrame(addScript);
        },
        applyNativeFunctionCall = function(name) {
            var queue = window[name + 'Queue'];

            if (queue) {
                Array.prototype.forEach.call(queue, function(item) {
                    window[name].apply(this, item);
                });
             }
        },
        setNativeFunctionCall = function(name) {
            var queue = name + 'Queue';

            // Create a function to catch early calls
            window[name] = function() {
                window[queue] = window[queue] || [];
                // Store arguments for each call so
                // true function can apply these when ready
                window[queue].push(arguments);
            };
        };

        nativeFunctionCalls.forEach(setNativeFunctionCall);

        window.applyNativeFunctionCall = applyNativeFunctionCall;

        GU.opts = opts;

        if (!GU.opts.skipStyle) {
            loadCss();
        }

        if (document.readyState === 'complete') {
            kickOff();
        } else {
            window.addEventListener('DOMContentLoaded', kickOff);
        }
    }
}());