import { init as commonInit } from 'bootstraps/common';
import { init as articleInit } from 'bootstraps/article';
import { init as atomsInit } from 'bootstraps/atoms';

const init = () => {
    commonInit();
    articleInit();
    atomsInit();
};

export { init };
