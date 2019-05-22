import services from 'modules/atoms/services';

function init() {
    const atomTypes = GU.opts.atoms;
    Object.keys(atomTypes).forEach(t => {
        const f = atomTypes[t];
        if (t === 'chart' || typeof f.default !== 'function' || f.default.length !== 1) {
            return;
        }
        bootAtomType(t, atomTypes[t]);
    });
    if ('chart' in atomTypes) {
        initCharts();
    }
}

function initCharts() {
    var iframes = Array.prototype.slice.call(document.querySelectorAll('.atom--chart > .atom__iframe'));
    window.addEventListener('message', function (event) {
        var message;
        var iframe = iframes.reduce(function (winner, candidate) {
            if (winner) {
                return winner;
            }

            try {
                return candidate.name === event.source.name ? candidate : null;
            } catch (e) {
                return null;
            }
        }, null);
        if (iframe) {
            try {
                message = JSON.parse(event.data);
                switch (message.type) {
                case 'set-height':
                    iframe.height = message.value;
                    break;
                default:
                }
                // eslint-disable-next-line no-empty
            } catch (e) {}
        }
    });

    iframes.forEach(function (iframe) {
        const src = (iframe.getAttribute('srcdoc') || '')
            .replace(/<gu-script>/g, '<script>')
            // eslint-disable-next-line no-useless-concat
            .replace(/<\/gu-script>/g, '<' + '/script>');
        iframe.setAttribute('srcdoc', src);
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
            atom.start();
        }
    }
}

export { init };
