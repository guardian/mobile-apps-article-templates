/*global window,document,console,define */
define([
    'bean',
    'modules/$',
    'modules/twitter'
], function (
    bean,
    $,
    twitter
) {
    'use strict';

    var modules = {
        asideWitness: function () {
            // Moves the Witness aside to better place (4 paragraphs in)
            var bodyLength = $(".article__body p").length;
            if (bodyLength > 4) {
                $(".aside-witness").addClass("js--positioned").prependTo(".article__body p:nth-of-type(4)");
            } else {
                bodyLength = bodyLength - 1;
                $(".aside-witness").addClass("js--positioned").prependTo(".article__body p:nth-of-type(" + bodyLength + ")");
            }
        }
    },

    ready = function () {
        if (!this.initialised) {
            this.initialised = true;
            modules.asideWitness();
            twitter.init();
            twitter.enhanceTweets();
            // console.info("Article ready");
        }
    };

    return {
        init: ready,
    };
});
