define([
], function (
) {
    'use strict';

    /* --- EXAMPLE START --- */

    // var tests = { 
    //     lowFrictionParticipation: lowFrictionParticipation.init
    // }

    /* --- EXAMPLE END --- */
        
    var tests = {};

    function init() {
        var key,
            testSpec;

        if (GU.opts.tests) {
            testSpec = JSON.parse(GU.opts.tests);

            for (key in testSpec) {
                if (testSpec.hasOwnProperty(key) && tests[key]) {
                    tests[key](testSpec[key]);
                }
            }
        }
    }

    return {
        init: init
    };
});