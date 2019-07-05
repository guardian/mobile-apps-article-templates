import { init as commonInit } from 'bootstraps/common';
import { init as articleInit, cartoonView } from 'bootstraps/article';
import { init as atomsInit } from 'bootstraps/atoms';
import { init as campaignInit } from 'bootstraps/campaign';

const init = () => {
    commonInit();
    articleInit();
    atomsInit();
    campaignInit();
    setTimeout(() => {
        cartoonView();
    }, 2000);
};

export { init };
