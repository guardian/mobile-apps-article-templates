import { init as commonInit } from 'bootstraps/common';
import { init as videoInit } from 'bootstraps/video';

const init = () => {
    commonInit();
    videoInit();
};

export { init };
