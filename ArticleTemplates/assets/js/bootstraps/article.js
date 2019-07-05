import { init as youtubeInit } from 'modules/youtube';
import { init as twitterInit } from 'modules/twitter';
import { init as quizInit } from 'modules/quiz';
import { init as immersiveInit } from 'modules/immersive';
import { init as creativeInjectorInit } from 'modules/creativeInjector';
import { init as messengerInit } from 'modules/messenger';
import resizeInit from 'modules/messenger/resize';
import Hammer from 'hammerjs';

function richLinkTracking() {
    let i;
    let j;
    let href;
    let link;
    let links;
    let richLink;
    const richLinks = document.getElementsByClassName('element-rich-link');

    for (i = 0; i < richLinks.length; i++) {
        richLink = richLinks[i];
        links = richLink.getElementsByTagName('a');

        for (j = 0; j < links.length; j++) {
            link = links[j];
            href = link.getAttribute('href');
            if (href !== '') {
                link.setAttribute('href', `${href}?ArticleReferrer=RichLink`);
            }
        }
    }
}

function getUrlParameter(url, name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(url);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function wrap(el, wrapper) {
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
}

function cartoonView() {
    const iframes = Array.from(document.querySelectorAll('.element-interactive.interactive iframe'))
    if (iframes.length == 1) {
        const src = iframes[0].src;
        const imageSrcs = getUrlParameter(src, 'srcs-mobile');
        const desktopSrc = getUrlParameter(src, 'srcs-desktop');
        let comicStrips;
        if (imageSrcs) {
            comicStrips = imageSrcs.split(' ');
        }

        const hammerSettings = (GU.opts.platform === 'ios' ? { touchAction: 'auto' } : {})

        iframes[0].parentNode.style.overflow = 'hidden';
        comicStrips.forEach(strip => {
            const img = document.createElement('img');
            img.src = strip;
            img.style.width = "100%";
            iframes[0].parentNode.append(img);
            const mc = new Hammer.Manager(img, hammerSettings);
            const pinch = new Hammer.Pinch();
            const pan = new Hammer.Pan();

            mc.add(pinch);
            mc.add(pan);

            mc.on('pinch', ev => {
                if (GU.opts.platform === 'ios') {
                    ev.preventDefault();
                }

                const desiredScale = ev.scale;
                const pinchCentre = getPinchCentre(img);

                img.style.transformOrigin = `${pinchCentre.x}% ${pinchCentre.y}%`;
                img.style.transform = `scale(${desiredScale})`;
            });

            mc.on('pinchstart', ev => {
                lockArticleSwipe(true);
                savePinchCentre(img, ev);
            });

            mc.on('pinchend', () => {
                lockArticleSwipe(false);
                bounceToInitialPosition(img);
            });

            mc.on("panleft panright", function(e) {
                lockArticleSwipe(true);
                console.log(e.type)
                console.log(e.deltaX);
                console.log(e.deltaY);
            });
        })
        iframes[0].parentNode.removeChild(iframes[0]);
    }
}

function lockArticleSwipe(toggle) {
    if (GU.opts.platform === 'android') {
        window.GuardianJSInterface.registerRelatedCardsTouch(toggle);
    }
}

function getPinchCentre({dataset}) {
    const pinchX = dataset.pinchCentreX;
    const pinchY = dataset.pinchCentreY;
    return {x: pinchX, y: pinchY};
}

function savePinchCentre(el, {center}) {
    const elBounds = el.getBoundingClientRect();
    const pinchCentreX = calcPinchCentre(elBounds, center, 'x', 'width');
    const pinchCentreY = calcPinchCentre(elBounds, center, 'y', 'height');

    el.dataset.pinchCentreX = pinchCentreX;
    el.dataset.pinchCentreY = pinchCentreY;
}

function calcPinchCentre(elBounds, pinchCentre, axis, dimension) {
    const elStart = elBounds[axis];
    const elEnd = elBounds[dimension];
    const pinch = pinchCentre[axis];

    const pinchRel = (pinch-elStart)/(elEnd);
    if (pinchRel > 0.75) {
        return 100
    } else if (pinchRel < 0.25) {
        return 0
    } else {
        return Math.round(pinchRel*100);
    }
}

function bounceToInitialPosition(el) {
    const currentScale = (el.getBoundingClientRect().width/el.offsetWidth);
    const newScale = currentScale + (1-currentScale)/5;
    if (newScale >= 1) {
        lockArticleSwipe(false);
        return;
    } else {
        requestAnimationFrame(() => {
            bounceToInitialPosition(el);
        });
    }
}

function init() {
    youtubeInit();
    twitterInit();
    quizInit();
    immersiveInit();
    creativeInjectorInit();
    messengerInit([resizeInit]);
    richLinkTracking();
}

export { init, cartoonView };
