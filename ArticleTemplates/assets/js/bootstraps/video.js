import { init as commonInit } from 'bootstraps/common';
import { init as youtubeInit } from 'modules/youtube';

const init = () => {
    commonInit();
    youtubeInit();
};

export { init };