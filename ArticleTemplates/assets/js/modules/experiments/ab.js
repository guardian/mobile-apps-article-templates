//  --- EXAMPLE ---
// var tests = {
//     lowFrictionParticipation: lowFrictionParticipation.init
// }

const tests = {};

function init() {
    let key;
    let testSpec;

    if (GU.opts.tests) {
        testSpec = JSON.parse(GU.opts.tests);

        for (key in testSpec) {
            if (testSpec.hasOwnProperty(key) && tests[key]) {
                tests[key](testSpec[key]);
            }
        }
    }
}

export { init };