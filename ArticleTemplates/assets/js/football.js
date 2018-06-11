import { init as initCommon } from 'bootstraps/common';
import { init as initFootball } from 'bootstraps/football';
import { init as initLiveblog } from 'bootstraps/liveblog';

const init = () => {
    initCommon();
    initFootball();
    if (document.getElementsByClassName('article__body--liveblog').length > 0) {
        initLiveblog();
    }
};

export { init };
