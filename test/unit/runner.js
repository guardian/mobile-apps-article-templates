require.config({
    baseUrl: '/root/ArticleTemplates/assets/js',
    paths: {

        // -- components
        bonzo: '../../../node_modules/bonzo/bonzo',
        bean: '../../../node_modules/bean/bean',
        d3: '../../../node_modules/d3/d3',
        domReady: '../../../node_modules/domready/ready',
        mobileSlider: 'components/mobile-range-slider',
        fastClick: '../../../node_modules/fastclick/lib/fastclick',
        qwery: '../../../node_modules/qwery/qwery',
        fence: '../../../node_modules/fence/fence',
        smoothScroll: '../../../node_modules/smooth-scroll/dist/js/smooth-scroll',
        twitter: 'https://platform.twitter.com/widgets',

        // -- tests
        test_common: '/root/test/unit/common',
        test_ads: '/root/test/unit/ads',
        test_twitter: '/root/test/unit/twitter',
        test_comments: '/root/test/unit/comments'
    },
    shim: {
        d3: {
            exports: 'd3'
        }
    }
});

require(['twitter', 'test_common', 'test_ads', 'test_twitter', 'test_comments'], function(){
  twttr.ready(function(){
    mocha.run();
  });
});

// bind polyfill for phantomjs
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP && oThis
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}