define([
  'modules/services/impl/viewport-io',
  'modules/services/impl/viewport-scroll'
], function (viewportIO, viewportScroll) {
  return 'IntersectionObserver' in window 
    ? viewportIO
    : viewportScroll;
});