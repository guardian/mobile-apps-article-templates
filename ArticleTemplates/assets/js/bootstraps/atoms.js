import services from 'modules/atoms/services';

function bootAtomType(atomType, atomFactory) {
    const atomBuilder = atomFactory.default(services);
    const atoms = document.querySelectorAll(`.element-atom[data-atom-type="${atomType}"]`);
    for (let i = 0; i < atoms.length; i++) {
        const atom = atomBuilder(atoms[i]).runTry();
        if (typeof atom === 'string') {
            console.log(`Failed to initialise atom [${atomType}/${atoms[i].getAttribute('data-atom-id')}]: ${atom}`); // eslint-disable-line no-console
        } else {
            atom.start();
        }
    }
}

function init() {
    const atomTypes = GU.opts.atoms;
    Object.keys(atomTypes).forEach((t) => {
        const f = atomTypes[t];
        if (typeof f.default !== 'function' || f.default.length !== 1) {
            return;
        }
        bootAtomType(t, atomTypes[t]);
    });
}

export { init };
