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

        Object.keys(testSpec).forEach(key => {
            if (tests[key]) {
                tests[key](testSpec[key]);
            }
        });
    }
}

export { init };
