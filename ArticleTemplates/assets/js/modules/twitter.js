import { isDarkMode } from 'modules/util';
import { initPositionPoller } from 'modules/cards';
import { initMpuPoller } from 'modules/ads';
import { resetAndCheckForVideos } from 'modules/youtube';

let articleBody;
let isAndroid;
let tweets;
let tweetHeights = [];
let scriptReady = false;

function init(readyCallback) {
    isAndroid = GU.opts.platform === 'android';
    articleBody = document.getElementsByClassName('article__body')[0];
    checkForTweets(readyCallback);
}

function checkForTweets(readyCallback) {
    if (GU.opts.disableEnhancedTweets) {
        return;
    }

    tweets = document.body.querySelectorAll('blockquote.js-tweet, blockquote.twitter-tweet');

    if (tweets.length && !scriptReady) {
        const themeMeta = document.getElementById('twitter-theme');
        if (isDarkMode() && themeMeta) {
            themeMeta.setAttribute('content', 'dark');
        }

        loadScript(readyCallback);
    }
}

function loadScript(readyCallback) {
    let scriptElement;

    if (document.getElementById('twitter-widget')) {
        return;
    }

    scriptElement = document.createElement('script');

    scriptElement.id = 'twitter-widget';
    scriptElement.async = true;
    scriptElement.src = 'https://platform.twitter.com/widgets.js';
    scriptElement.onload = onScriptLoaded.bind(null, readyCallback);

    document.body.appendChild(scriptElement);
}

function onScriptLoaded(readyCallback) {
    scriptReady = isScriptReady(readyCallback);
}

function isScriptReady(readyCallback) {
    if (scriptReady) {
        return true;
    } else if (typeof twttr !== 'undefined' && 'widgets' in twttr && 'load' in twttr.widgets) {
        twttr.events.bind('rendered', workaroundClicks);
        twttr.events.bind('rendered', fixVineAutoplay);
        twttr.events.bind(
            'loaded',
            function (event) {
                if (readyCallback) {
                    readyCallback()
                }
            }
        );
        scriptReady = true;
        return true;
    }

    return false;
}

function enhanceTweet(tweet) {
    if (isScriptReady()) {
        addTweetClass(tweet);
    } else {
        removeTweetClass(tweet);
    }
}

function addTweetClass(tweet) {
    tweet.classList.add('twitter-tweet');
    tweet.classList.remove('js-tweet');
}

function removeTweetClass(tweet) {
    tweet.classList.remove('twitter-tweet');
    tweet.classList.add('js-tweet');
}

function enhanceTweets() {
    let i;
    let tweetHeightChange = false;
    for (i = 0; i < tweets.length; i++) {
        enhanceTweet(tweets[i])
        if (tweetHeights[i] !== tweets[i].clientHeight) {
            tweetHeightChange = true;
            tweetHeights[i] = tweets[i].clientHeight;
        }
    }

    if (tweetHeightChange && articleBody){
        twttr.widgets.load(articleBody);
        // When a tweets been enhanced check position of related cards placeholder
        initPositionPoller();
        initMpuPoller(0);
        resetAndCheckForVideos();
    }
}

function workaroundClicks(evt) {
    let i;
    let webIntentLinks;

    if (!isAndroid,
        evt.target.contentWindow &&
        evt.target.contentWindow.document) {
            webIntentLinks = evt.target.contentWindow.document.querySelectorAll('a.web-intent');
            for (i = 0; i < webIntentLinks.length; i++) {
                webIntentLinks[i].classList.remove('web-intent');
            }
    }
}

function fixVineAutoplay(evt) {
    let i;
    let mediaCards;

    if (!isAndroid &&
        evt.target.contentWindow &&
        evt.target.contentWindow.document &&
        evt.target.contentWindow.document.querySelectorAll('iframe[src^="https://vine.co"],iframe[src^="https://amp.twimg.com/amplify-web-player/prod/source.html?video_url"]').length) {
            mediaCards = evt.target.contentWindow.document.getElementsByClassName('MediaCard');
            for (i = 0; i < mediaCards.length; i++) {
                if (mediaCards[i].parentNode) {
                    mediaCards[i].parentNode.removeChild(mediaCards[i]);
                }
            }
            evt.target.removeAttribute('height');
    }
}

export { init, checkForTweets, enhanceTweets };