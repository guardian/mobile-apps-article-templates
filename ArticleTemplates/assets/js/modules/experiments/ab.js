define([], function () {
    'use strict';


    // Example property of tests object
    // lowFrictionParticipation: lowFrictionParticipation.init 
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