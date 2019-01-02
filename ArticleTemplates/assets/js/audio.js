import { init as commonInit } from 'bootstraps/common';
import { init as audioInit } from 'bootstraps/audio';

const init = () => {
    commonInit();
    audioInit();
};

export { init };
