import { init as youtubeInit } from 'modules/youtube';
import { init as twitterInit } from 'modules/twitter';
import { init as witnessInit } from 'modules/witness';
import { init as initOutbrain } from 'modules/outbrain';
import { init as quizInit } from 'modules/quiz';
import { init as immersiveInit } from 'modules/immersive';
import { init as creativeInjectorInit } from 'modules/creativeInjector';
import { init as messengerInit } from 'modules/messenger';
import resizeInit from 'modules/messenger/resize';

function init() {
    setupGlobals();
    youtubeInit();
    twitterInit();
    witnessInit();
    quizInit();
    immersiveInit();
    creativeInjectorInit();
    messengerInit([resizeInit]);
    richLinkTracking();
}

function setupGlobals() {
    window.articleOutbrainInserter = initOutbrain;
    window.applyNativeFunctionCall('articleOutbrainInserter');
}

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

export { init };