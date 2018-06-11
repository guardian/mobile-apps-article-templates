
import viewportIO from 'modules/services/impl/viewport-io';
import viewportScroll from 'modules/services/impl/viewport-scroll';

export default 'IntersectionObserver' in window ? viewportIO : viewportScroll;
