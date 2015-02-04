require.config({
    baseUrl: '/root/ArticleTemplates/assets/js',
    paths: {

        // -- components
        bonzo: 'components/bonzo',
        bean: 'components/bean',
        d3: 'components/d3',
        domReady: 'components/ready',
        mobileSlider: 'components/mobile-range-slider',
        fastClick: 'components/fastclick',
        qwery: 'components/qwery',
        fence: 'components/fence',
        smoothScroll: 'components/smooth-scroll',

        // -- tests
        test_common: '/root/test/unit/common',
        test_ads: '/root/test/unit/ads'
    },
    shim: {
        d3: {
            exports: 'd3'
        }
    }
});

require(['test_common','test_ads'], function(){
    mocha.run();
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