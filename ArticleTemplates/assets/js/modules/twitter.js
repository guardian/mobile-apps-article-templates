/*global twttr:false */

/* TODO
 - check if there are tweets when 'more-content' is pressed == will be solved with #3
 - remove polling
 - add mediator and debounce 
*/

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
    var body = qwery('.article__body--liveblog');

    function bootstrap() {
        bean.on(window, 'scroll', function(){             
            if(timeoutId){
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(enhanceTweets, 200);
        });
    }

    function enhanceTweets() {

        var scriptElement,
            tweetElements       = qwery('blockquote.js-tweet, blockquote.twitter-tweet'),
            widgetScript        = qwery('#twitter-widget'),
            viewportHeight      = bonzo.viewport().height,
            scrollTop           = bonzo(document.body).scrollTop(),
            processedTweets     = 0;

        tweetElements.forEach(function (element) {
            var $el = bonzo(element);
            if (((scrollTop + (viewportHeight * 2.5)) > $el.offset().top) && (scrollTop < ($el.offset().top + $el.offset().height))) {
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
                if (typeof twttr !== 'undefined' && 'widgets' in twttr && 'load' in twttr.widgets) {
                    if(processedTweets){
                        twttr.widgets.load(body);
                    }
                }
            }
        }
    }

    return {
        init: bootstrap,
        enhanceTweets: enhanceTweets
    };
});
