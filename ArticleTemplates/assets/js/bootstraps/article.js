import { init as youtubeInit } from 'modules/youtube';
import { init as twitterInit } from 'modules/twitter';
import { init as quizInit } from 'modules/quiz';
import { init as immersiveInit } from 'modules/immersive';
import { init as numberedListInit } from 'modules/numberedList';
import { init as creativeInjectorInit } from 'modules/creativeInjector';
import { init as messengerInit } from 'modules/messenger';
import { init as listenToArticleInit } from 'modules/listen-to-article';
import resizeInit from 'modules/messenger/resize';

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

function init() {
    youtubeInit();
    twitterInit();
    quizInit();
    immersiveInit();
    numberedListInit();
    creativeInjectorInit();
    messengerInit([resizeInit]);
    richLinkTracking();
    listenToArticleInit();
}

export { init };
