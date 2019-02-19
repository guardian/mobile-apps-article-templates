import services from 'modules/atoms/services';
import { initPositionPoller } from 'modules/cards';
import { initMpuPoller } from 'modules/ads';
import { resetAndCheckForVideos } from 'modules/youtube';

function init() {
    const atomTypes = GU.opts.atoms;
    Object.keys(atomTypes).forEach(t => {
        const f = atomTypes[t];
        if (typeof f.default !== 'function' || f.default.length !== 1) {
            return;
        }
        bootAtomType(t, atomTypes[t]);
    });
}

function bootAtomType(atomType, atomFactory) {
    const atomBuilder = atomFactory.default(services);
    const atoms = document.querySelectorAll(`.element-atom[data-atom-type="${atomType}"]`);
    for (let i = 0; i < atoms.length; i++) {
        const atom = atomBuilder(atoms[i]).runTry();
        if (typeof atom === 'string') {
            console.log(`Failed to initialise atom [${atomType}/${atoms[i].getAttribute('data-atom-id')}]: ${atom}`);
        } else {
            initExpandables(atoms[i]);
            atom.start();
        }
    }
}

function initExpandables(atom) {
    Array.prototype.slice.call(atom.getElementsByTagName('details')).forEach(function(d) {
        d.addEventListener('click', function() {
            initPositionPoller(0);
            initMpuPoller(0, false);
            resetAndCheckForVideos();
        });
    });
}

export { init };
