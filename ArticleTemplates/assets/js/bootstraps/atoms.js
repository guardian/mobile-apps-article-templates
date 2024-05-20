import services from 'modules/atoms/services';
import { initPositionPoller } from 'modules/cards';
import { initMpuPoller } from 'modules/ads';
import { resetAndCheckForVideos } from 'modules/youtube';

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
    if ('interactive' in atomTypes) {
        initInteractives();
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

function scrollListener() {
    const containers = [...document.querySelectorAll('figure[data-atom-type="interactive"]')].flatMap(element => element instanceof HTMLElement ? [element] : []);
    containers.forEach(function (container) {
        const rect = container.getBoundingClientRect();
        const iframe = container.querySelector('iframe');
        let scroll = -rect.top;
        if (rect.top > 0) {
            scroll = 0;
        } else if (rect.top < -rect.height) {
            scroll = rect.height;
        }
        iframe?.contentWindow?.postMessage({
            kind: 'interactive:scroll',
            scroll
        }, '*');
    })
}

function initInteractives() {
    const iframes = [...document.querySelectorAll('figure[data-atom-type="interactive"] > iframe')].flatMap(element => element instanceof HTMLIFrameElement ? [element] : []);
    window.addEventListener('message', function (event) {
        var iframe = iframes.find(function({ name }) { return name === event.source.name; });
        if (!iframe) return;
        try {
            const message = JSON.parse(event.data);
            switch (message.kind) {
            case 'interactive:height':
                iframe.height = message.height;
                break;
            case 'interactive:scroll':
                window.addEventListener('scroll', scrollListener)
                iframe.classList.add('scrolly');
                break;
            default:
            }
        } catch (e) {
        // do nothing
        }
    });
}

export { init };
