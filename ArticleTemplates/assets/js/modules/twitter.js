/*global twttr:false */

define([
    'bean',
    'bonzo',
    'qwery',
    'modules/$'
], function (
    bean,
    bonzo,
    qwery,
    $
) {
    var timeoutId;
    var body = qwery('.article__body');
    var isAndroid = $('body').hasClass('android');

    var theMinute,
        tweets,
        scriptReady = false;

    function bootstrap() {
        theMinute = document.body.classList.contains('the-minute');

        if (!theMinute) {
            checkForTweets(document.body);
            bean.on(window, 'scroll', GU.util.debounce(enhanceTweets, 100));
        }
    }

    function checkForTweets(parentElem) {
        tweets = parentElem.querySelectorAll('blockquote.js-tweet, blockquote.twitter-tweet');

        if (tweets && !scriptReady) {
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

        $(document.body).append(scriptElement);
    }

    function onScriptLoaded() {
        scriptReady = isScriptReady();

        enhanceTweets();
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
        var viewportHeight = bonzo.viewport().height,
            scrollTop = bonzo(document.body).scrollTop(),
            offsetHeight = tweet.offsetHeight,
            offsetTop = tweet.offsetTop;

        return ((scrollTop + (viewportHeight * 2.5)) > offsetTop) && (scrollTop < (offsetTop + offsetHeight));        
    }

    function enhanceTweet(tweet) {
        var tweetProcessed = false;

        if (isScriptReady()) {
            if (theMinute || isTweetInRange(tweet)) {
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

        if (processedTweets){
            twttr.widgets.load(body);
        }
    }

    function workaroundClicks(evt) {
        if(isAndroid){
            bean.on(evt.target.contentWindow.document, 'click', 'a', function(evt){
                var anchor = evt.currentTarget;
                window.open(anchor.getAttribute('href'));
                evt.stopImmediatePropagation();
                evt.preventDefault();
            });
        } else {
            $('a.web-intent', evt.target.contentWindow.document).removeClass('web-intent');
        }
    }

    function fixVineAutoplay(evt){
        if(!isAndroid && $('iframe[src^="https://vine.co"],iframe[src^="https://amp.twimg.com/amplify-web-player/prod/source.html?video_url"]', evt.target.contentWindow.document)[0]){
            $('.MediaCard', evt.target.contentWindow.document).remove();
            $(evt.target).removeAttr('height');
        }
    }

    return {
        init: bootstrap,
        checkForTweets: checkForTweets,
        enhanceTweets: enhanceTweets,
        // testing purposes
        modules: {
            fixVineAutoplay: fixVineAutoplay
        }
    };
});
