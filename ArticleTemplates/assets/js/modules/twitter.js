/*global twttr:false */

define(function () {
    'use strict';

    var articleBody,
        isAndroid,
        tweets,
        scriptReady = false;

    function ready() {
        isAndroid = document.body.classList.contains('android');
        articleBody = document.getElementsByClassName('article__body')[0];

        checkForTweets();
    }

    function checkForTweets() {
        tweets = document.body.querySelectorAll('blockquote.js-tweet, blockquote.twitter-tweet');

        if (tweets.length && !scriptReady) {
            loadScript();
        }
    }

    function loadScript() {
        var scriptElement;

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

        window.addEventListener('scroll', GU.util.debounce(enhanceTweets, 100));
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
        var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
            scrollTop = document.body.scrollTop,
            offsetHeight = tweet.offsetHeight,
            offsetTop = tweet.offsetTop;

        return ((scrollTop + (viewportHeight * 2.5)) > offsetTop) && (scrollTop < (offsetTop + offsetHeight));        
    }

    function enhanceTweet(tweet) {
        var tweetProcessed = false;

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
        var i,
            processedTweets = 0;

        for (i = 0; i < tweets.length; i++) {
            if (enhanceTweet(tweets[i])) {
                processedTweets++;
            }
        }

        if (processedTweets && articleBody){
            twttr.widgets.load(articleBody);
        }
    }

    function workaroundClicks(evt) {
        var i,
            webIntentLinks;

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
        var i,
            mediaCards;

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

    return {
        init: ready,
        checkForTweets: checkForTweets
    };
});
