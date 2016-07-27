define([
], function (
) {
    'use strict';

    // { 
    //     lowFrictionParticipation: lowFrictionParticipation.init (Example test object)
    // }
        
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