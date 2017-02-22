define([
    'modules/twitter',
    'modules/witness',
    'modules/outbrain',
    'modules/quiz',
    'modules/creativeInjector',
    'modules/youtube',
    'modules/immersive'
], function (
    twitter,
    witness,
    outbrain,
    quiz,
    creativeInjector,
    youtube,
    immersive
) {
    'use strict';

    var initialised;

    function init() {
        if (!initialised) {
            setupGlobals();
            youtube.init();
            twitter.init();
            witness.init();
            quiz.init();
            if (GU.opts.isImmersive) {
                immersive.init();
            }
            richLinkTracking();
            creativeInjector.init();
            initialised = true;
        }
    }

    function setupGlobals() {
        window.articleOutbrainInserter = outbrain.init;
        window.applyNativeFunctionCall('articleOutbrainInserter');
    }

    function richLinkTracking() {
        var i,
            j,
            href,
            link,
            links,
            richLink,
            richLinks = document.getElementsByClassName('element-rich-link');

        for (i = 0; i < richLinks.length; i++) {
            richLink = richLinks[i];
            links = richLink.getElementsByTagName('a');

            for (j = 0; j < links.length; j++) {
                link = links[j];
                href = link.getAttribute('href');
                if (href !== '') {
                    link.setAttribute('href', href + '?ArticleReferrer=RichLink');
                }
            }
        }
    }
    
    return {
        init: init
    };
});