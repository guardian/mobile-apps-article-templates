/*global window,document,console,define */
define([
    'bean',
    'modules/$',
    'modules/twitter',
    'modules/witness',
    'modules/outbrain'
], function (
    bean,
    $,
    twitter,
    witness,
    outbrain
) {
    'use strict';

    var ready = function () {
        if (!this.initialised) {
            this.initialised = true;
            twitter.init();
            twitter.enhanceTweets();
            witness.duplicate();
            outbrain.load();
        }
    };

    return {
        init: ready
    };
});
