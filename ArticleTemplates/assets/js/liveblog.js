import { init as commonInit } from 'bootstraps/common';
import { init as liveblogInit } from 'bootstraps/liveblog';
import { init as atomsInit } from 'bootstraps/atoms';
import { init as campaignInit } from 'bootstraps/campaign';
const init = () => {
    commonInit(true);
    liveblogInit();
    atomsInit();
    campaignInit();
};

export { init };
