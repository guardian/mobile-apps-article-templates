import 'core-js/fn/promise';
import 'raf/polyfill';
import domready from 'domready';

import ads from './modules/ads';

const init = opts => {
    window.GU.opts = opts;

    __webpack_public_path__ = `${opts.templatesDirectory}/assets/build/`;

    const nativeFunctionCalls = [
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

    const applyNativeFunctionCall = name => {
        const queue = window[name + 'Queue'];

        if (queue) {
            Array.prototype.forEach.call(queue, function(item) {
                window[name].apply(this, item);
            });
        }
    };

    const setNativeFunctionCall = name => {
        const queue = name + 'Queue';

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

    const loadCss = () => {
        const url = `assets/css/${opts.asyncStylesFilename}.css`;
        const basePath = opts.templatesDirectory;
        const link = document.createElement('link');

        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = basePath + url;

        document.getElementsByTagName('head')[0].appendChild(link);
    };

    const kickOff = () => {
        if (!opts.skipStyle) {
            loadCss();
        }

        const getAdType = () => {
            const contentType = opts.contentType;

            if ((contentType === 'liveblog' && !GU.opts.isMinute) || 
                (contentType !== 'liveblog' && document.querySelector('.article__body--liveblog'))) {
                return 'liveblog';
            }
    
            return 'default';
        };
        const contentType = opts.contentType;
        const adsEnabled = opts.adsEnabled === 'true' || opts.adsEnabled === 'mpu';

        // ads positioning
        if (adsEnabled) {
            ads.init({
                adsConfig: opts.adsConfig,
                adsType: getAdType(),
                mpuAfterParagraphs: opts.mpuAfterParagraphs
            });
        }

        // other article-specific functions
        if (contentType === 'article') {
            import(/* webpackChunkName: "article" */ './article').then(article => {
                article.init()
            });
        } else if (contentType === 'liveblog') {
            // require(['liveblog'], initLayout);
        } else if (contentType === 'audio') {
            import(/* webpackChunkName: "audio" */ './audio').then(audio => {
                audio.init()
            });
        } else if (contentType === 'gallery') {
            // require(['gallery'], initLayout);
        } else if (contentType === 'football') {
            // require(['football'], initLayout);
        } else if (contentType === 'cricket') {
            // require(['cricket'], initLayout);
        } else if (contentType === 'video') {
            // require(['video'], initLayout);
        } else {
            // require(['bootstraps/common'], initLayout);
        }
    };

    domready(kickOff);
}

const go = () => {
    window.GU.bootstrap = {
        init
    };
};

go();