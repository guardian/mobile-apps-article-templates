import { init as commonInit } from 'bootstraps/common';
import { init as liveblogInit } from 'bootstraps/liveblog';

const init = () => {
    commonInit(true);
    liveblogInit();
};

export { init };
