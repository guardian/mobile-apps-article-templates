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

    function bootstrap() {
        bean.on(window, 'scroll', function(){
            if(timeoutId){
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(enhanceTweets, 200);
        });
    }

    function enhanceTweets() {
        if ($('body').hasClass('the-minute')) {
            return;
        }

        var scriptElement,
            tweetElements       = qwery('blockquote.js-tweet, blockquote.twitter-tweet'),
            widgetScript        = qwery('#twitter-widget'),
            viewportHeight      = bonzo.viewport().height,
            scrollTop           = bonzo(document.body).scrollTop(),
            bindedCallBack      = false,
            processedTweets     = 0,
            scriptLoaded        = typeof twttr !== 'undefined' && 'widgets' in twttr && 'load' in twttr.widgets;

        tweetElements.forEach(function (element) {
            var $el = bonzo(element);
            if (scriptLoaded && ((scrollTop + (viewportHeight * 2.5)) > $el.offset().top) && (scrollTop < ($el.offset().top + $el.offset().height))) {
                $(element).removeClass('js-tweet').addClass('twitter-tweet');
                processedTweets ++;
            } else if($(element).hasClass('twitter-tweet')) {
                $(element).removeClass('twitter-tweet').addClass('js-tweet');
            }
        });

        if (tweetElements.length > 0) {
            if (widgetScript.length === 0) {
                scriptElement = document.createElement('script');
                scriptElement.id = 'twitter-widget';
                scriptElement.async = true;
                scriptElement.src = 'https://platform.twitter.com/widgets.js';
                $(document.body).append(scriptElement);
            } else {
                if (scriptLoaded) {
                    if(!bindedCallBack){
                        twttr.events.bind('rendered', workaroundClicks);
                        twttr.events.bind('rendered', fixVineAutoplay);
                        bindedCallBack = true;
                    }
                    if(processedTweets){
                       twttr.widgets.load(body);
                    }
                }
            }
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
        enhanceTweets: enhanceTweets,
        // testing purposes
        modules: {
            fixVineAutoplay: fixVineAutoplay
        }
    };
});
