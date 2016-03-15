/*global window,document,console,define */
define([
    'layouts/Layout',
    'bean',
    'bonzo',
    'modules/$',
    'modules/twitter',
    'modules/witness',
    'modules/outbrain',
    'modules/quiz',
    'smoothScroll'
], function (
    Layout,
    bean,
    bonzo,
    $,
    twitter,
    witness,
    outbrain,
    Quiz,
    smoothScroll
) {
    'use strict';

    var Article = Layout.extend({
        init: function () {
            this._super.apply(this, arguments);

            console.log("*** Article init ***");
        }
    });

    return Article;
});
