import { init as initCommon } from 'bootstraps/common';
import { init as initCricket } from 'bootstraps/cricket';
import { init as initLiveblog } from 'bootstraps/liveblog';

const init = () => {
    initCommon();
    initCricket();
    if (document.getElementsByClassName('article__body--liveblog').length > 0) {
        initLiveblog();
    }
};

export { init };
