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
        var testSpec;

        if (GU.opts.tests) {
            testSpec = JSON.parse(GU.opts.tests);
            testSpec.abTests && initialiseTests(testSpec.abTests);
        }
    }

    function initialiseTests(abTests) {
        var i;

        for (i = 0; i < abTests.length; i++) {
            if (tests[abTests[i].id]) {
                tests[abTests[i].id]();
            }
        }
    }

    function initLowFrictionParticipation() {
        lowFrictionParticipation.init();
    }

    return {
        init: init
    };
});