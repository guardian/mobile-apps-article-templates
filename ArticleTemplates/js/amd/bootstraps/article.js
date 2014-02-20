/*global window,document,console,define */
define([
    'modules/$'
], function (
    $
) {
    'use strict';

    var ready = function () {
            if (!this.initialised) {
                this.initialised = true;
                // console.info("Article ready");
            }
        };

    return {
        init: ready
    };

});
