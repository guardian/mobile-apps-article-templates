import 'core-js/fn/promise';
import 'raf/polyfill';
import domready from 'domready';

import ads from './modules/ads';

const init = opts => {
    window.GU.opts = opts;

    __webpack_public_path__ = `${opts.templatesDirectory}/assets/build/`; // eslint-disable-line camelcase

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
        'injectInlineArticleMembershipCreative',
    ];

    const applyNativeFunctionCall = name => {
        const queue = window[`${name}Queue`];

        if (queue) {
            Array.prototype.forEach.call(queue, (item) => {
                window[name].apply(this, item);
            });
        }
    };

    const setNativeFunctionCall = name => {
        const queue = `${name}Queue`;

        // Create a function to catch early calls
        window[name] = () => {
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

        const { contentType } = opts;

        const getAdType = () => {
            if ((contentType === 'liveblog' && !GU.opts.isMinute) ||
                (contentType !== 'liveblog' && document.querySelector('.article__body--liveblog'))) {
                return 'liveblog';
            }

            return 'default';
        };

        const adsEnabled = opts.adsEnabled === 'true' || opts.adsEnabled === 'mpu';

        // ads positioning
        if (adsEnabled) {
            ads.init({
                adsConfig: opts.adsConfig,
                adsType: getAdType(),
                mpuAfterParagraphs: opts.mpuAfterParagraphs,
            });
        }

        // other article-specific functions
        if (contentType === 'article') {
            import(/* webpackChunkName: "article" */ './article').then(article => {
                article.init();
            });
        } else if (contentType === 'liveblog') {
            import(/* webpackChunkName: "liveblog" */ './liveblog').then(liveblog => {
                liveblog.init();
            });
        } else if (contentType === 'audio') {
            import(/* webpackChunkName: "audio" */ './audio').then(audio => {
                audio.init();
            });
        } else if (contentType === 'gallery') {
            import(/* webpackChunkName: "gallery" */ './gallery').then(gallery => {
                gallery.init();
            });
        } else if (contentType === 'football') {
            import(/* webpackChunkName: "football" */ './football').then(football => {
                football.init();
            });
        } else if (contentType === 'cricket') {
            import(/* webpackChunkName: "cricket" */ './cricket').then(cricket => {
                cricket.init();
            });
        } else if (contentType === 'video') {
            import(/* webpackChunkName: "video" */ './video').then(video => {
                video.init();
            });
        } else {
            import(/* webpackChunkName: "common" */ './bootstraps/common').then(common => {
                common.init();
            });
        }
    };

    domready(kickOff);
};

const go = () => {
    window.GU.bootstrap = {
        init,
    };
};

go();
