import { debounce } from 'modules/util';
import { initPositionPoller } from 'modules/cards';
import { initMpuPoller } from 'modules/ads';


let articleBody;
let isAndroid;
let tweets;
let scriptReady = false;

function init() {
    isAndroid = GU.opts.platform === 'android';
    articleBody = document.getElementsByClassName('article__body')[0];

    checkForTweets();
}

function checkForTweets() {
    if (GU.opts.disableEnhancedTweets) {
        return;
    }

    tweets = document.body.querySelectorAll('blockquote.js-tweet, blockquote.twitter-tweet');

    if (tweets.length && !scriptReady) {
        loadScript();
    }
}

function loadScript() {
    let scriptElement;

    if (document.getElementById('twitter-widget')) {
        return;
    }

    scriptElement = document.createElement('script');

    scriptElement.id = 'twitter-widget';
    scriptElement.async = true;
    scriptElement.src = 'https://platform.twitter.com/widgets.js';
    scriptElement.onload = onScriptLoaded;

    document.body.appendChild(scriptElement);
}

function onScriptLoaded() {
    scriptReady = isScriptReady();

    if (scriptReady) {
        enhanceTweets();
    }

    window.addEventListener('scroll', debounce(enhanceTweets, 100));
}

function isScriptReady() {
    if (scriptReady) {
        return true;
    } else if (typeof twttr !== 'undefined' && 'widgets' in twttr && 'load' in twttr.widgets) {
        twttr.events.bind('rendered', workaroundClicks);
        twttr.events.bind('rendered', fixVineAutoplay);
        scriptReady = true;
        return true;
    }

    return false;
}

function isTweetInRange(tweet) {
    const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const scrollTop = document.body.scrollTop;
    const offsetHeight = tweet.offsetHeight;
    const offsetTop = tweet.offsetTop;

    return ((scrollTop + (viewportHeight * 2.5)) > offsetTop) && (scrollTop < (offsetTop + offsetHeight));
}

function enhanceTweet(tweet) {
    let tweetProcessed = false;

    if (isScriptReady()) {
        if (isTweetInRange(tweet)) {
            addTweetClass(tweet);
            tweetProcessed = true;
        } else {
            removeTweetClass(tweet);
        }
    } else {
        removeTweetClass(tweet);
    }

    return tweetProcessed;
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
    let processedTweets = 0;

    for (i = 0; i < tweets.length; i++) {
        if (enhanceTweet(tweets[i])) {
            processedTweets++;
        }
    }

    if (processedTweets && articleBody){
        twttr.widgets.load(articleBody);
        // When a tweets been enhanced check position of related cards placeholder
        initPositionPoller();
        initMpuPoller(0);
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

export { init, checkForTweets };