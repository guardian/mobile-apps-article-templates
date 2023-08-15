import { init as commonInit } from 'bootstraps/common';
import { init as articleInit } from 'bootstraps/article';
import { init as atomsInit } from 'bootstraps/atoms';
import { init as campaignInit } from 'bootstraps/campaign';
import { init as communityCalloutInit } from 'bootstraps/communityCallout';
import { init as listenToArticleInit } from 'bootstraps/listenToArticles';

const init = () => {
    commonInit();
    articleInit();
    atomsInit();
    campaignInit();
    communityCalloutInit();
    listenToArticleInit();
};

export { init };
