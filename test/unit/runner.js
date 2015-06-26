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
        raven: '../../../node_modules/raven-js/dist/raven',

        // -- tests
        test_common: '/root/test/unit/common',
        test_ads: '/root/test/unit/ads',
        test_twitter: '/root/test/unit/twitter',
        test_comments: '/root/test/unit/comments',
        test_colors: '/root/test/unit/colors',
        test_monitor: '/root/test/unit/monitor',
        test_audio: '/root/test/unit/audio',
        test_sharing: '/root/test/unit/sharing',
        test_witness: '/root/test/unit/witness',
        test_cricket: '/root/test/unit/cricket'

    },
    shim: {
        d3: {
            exports: 'd3'
        }
    }
});

require([
    'twitter', 'test_common', 'test_ads','test_twitter',
    'test_colors', 'test_comments', 'test_monitor',
    'test_audio', 'test_witness', 'test_sharing',
    'test_cricket'
  ], function(){
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