define([
    'modules/experiments/lowFrictionParticipation'
], function (
    lowFrictionParticipation
) {
    'use strict';

    var tests = {
        'lowFrictionParticipation': initLowFrictionParticipation
    };

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

    function initLowFrictionParticipation(variant) {
        if (variant === 'true') {
            lowFrictionParticipation.init();
        }
    }

    return {
        init: init
    };
});