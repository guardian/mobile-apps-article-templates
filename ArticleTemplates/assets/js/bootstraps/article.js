/*global window,document,console,define */
define([
    'bean',
    'modules/$',
    'modules/twitter',
    'modules/witness'
], function (
    bean,
    $,
    twitter,
    witness
) {
    'use strict';

    ready = function () {
        if (!this.initialised) {
            this.initialised = true;
            twitter.init();
            twitter.enhanceTweets();
            witness.duplicate();
        }
    };

    return {
        init: ready
    };
});
