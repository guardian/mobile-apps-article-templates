import 'core-js/stable/promise';
import 'raf/polyfill';
import '@babel/polyfill';
import domready from 'domready';
import { init as adsInit } from 'modules/ads';

const init = opts => {
    const { GU: { opts: { test = false } = {} } = {} } = window;
    window.GU.opts = opts;

    if (!test) {
        __webpack_public_path__ = `${opts.templatesDirectory}/assets/build/`;
    }

    const nativeFunctionCalls = [
        'articleCommentsInserter',
        'articleCardsInserter',
        'articleCardsFailed',
        'articleTagInserter',
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
        'liveblogInsertBlocks',
        'liveblogInsertGap',
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
            if ((contentType === 'liveblog') ||
                (contentType !== 'liveblog' && document.querySelector('.article__body--liveblog'))) {
                return 'liveblog';
            }

            if (contentType === 'gallery') {
                return 'gallery';
            }

            return 'default';
        };

        const getHideAdsTest = (tests) => {
            if (!tests) return 0;
            try {
                const parsedTests = JSON.parse(tests);
                if (!parsedTests.hideAdsTest) return 0;
                return parsedTests.hideAdsTest;
            } catch (error) {
                return 0;
            }
        };

        const {
            contentType,
            adsEnabled,
            adsConfig,
            mpuAfterParagraphs,
            tests
        } = window.GU.opts;

        // ads positioning
        if (adsEnabled && (adsEnabled === 'true' || adsEnabled.includes('mpu'))) {
            adsInit({
                adsConfig,
                adsType: getAdType(contentType),
                mpuAfterParagraphs,
                hideAdsTest: getHideAdsTest(tests)
            });
        }

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

        const listenForEmailEmbedIFrameResize = () => {
            const allowedOrigins = ['https://www.theguardian.com'];

            const allIframes = [].slice.call(
                document.querySelectorAll('.email-sub__iframe')
            );
            window.addEventListener('message', (event) => {
                if (!allowedOrigins.includes(event.origin)) return;

                const iframes = allIframes.filter((i) => {
                    try {
                        return i.contentWindow === event.source;
                    } catch (e) {
                        return false;
                    }
                });
                if (iframes.length !== 0) {
                    try {
                        const message = JSON.parse(event.data);
                        switch (message.type) {
                        case 'set-height': {
                            const value = parseInt(message.value);
                            if (!Number.isInteger(value)) return;

                            iframes.forEach((iframe) => {
                                iframe.height = value;
                            });
                            break;
                        }
                        default:
                        }
                        // eslint-disable-next-line no-empty
                    } catch (e) {}
                }
            });
        };

        listenForEmailEmbedIFrameResize();
    };

    if (test) {
        kickOff();
    }

    domready(kickOff);
};

const go = () => {
    if (window.GU) {
        window.GU.bootstrap = {
            init
        };
    }
};

go();

export { init, go };
