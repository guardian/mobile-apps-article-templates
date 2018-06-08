import { init as commonInit } from 'bootstraps/common';
import { init as galleryInit } from 'bootstraps/gallery';

const init = () => {
    commonInit();
    galleryInit();
};

export { init };
