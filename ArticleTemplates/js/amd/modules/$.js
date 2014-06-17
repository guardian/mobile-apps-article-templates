/*global define */
define([
    'bonzo',
    'qwery'
], function (
    bonzo,
    qwery
) {
    'use strict';

    function $(selector, context) {
        return bonzo(qwery(selector, context));
    }

    return $;

});