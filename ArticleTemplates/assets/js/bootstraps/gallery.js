import Hammer from 'hammerjs';

function init() {
    lazyLoadImages();
    var galleryImages = document.querySelectorAll('.touch-gallery__images');
    galleryImages.forEach(function(galleryImage) {
        var hammerSettings = (GU.opts.platform === 'ios' ? { touchAction: 'auto' } : {})
        var mc = new Hammer.Manager(galleryImage, hammerSettings);
        var pinch = new Hammer.Pinch();

        mc.add(pinch);

        mc.on('pinch', function(ev) {
            if (GU.opts.platform === 'ios') {
                ev.preventDefault();
            }

            var desiredScale = ev.scale;
            var pinchCentre = getPinchCentre(galleryImage);

            galleryImage.style.transformOrigin = pinchCentre.x+'% '+pinchCentre.y+'%';
            galleryImage.style.transform = 'scale('+desiredScale+')';
        });

        mc.on('pinchstart', function(ev) {
            galleryImage.classList.add('touch-gallery__images--pinch');
            lockArticleSwipe(true);
            savePinchCentre(galleryImage, ev);
        });

        mc.on('pinchend', function() {
            lockArticleSwipe(false);
            bounceToInitialPosition(galleryImage);
        });

    });

    function lockArticleSwipe(toggle) {
        var isAndroidApp = (window.location.origin === "file://" && /(android)/i.test(navigator.userAgent) ) ? true : false;
        if (isAndroidApp) {
            window.GuardianJSInterface.registerRelatedCardsTouch(toggle);
        }
    }

    function getPinchCentre(el) {
        var pinchX = el.dataset.pinchCentreX;
        var pinchY = el.dataset.pinchCentreY;
        return {x: pinchX, y: pinchY};
    }

    function savePinchCentre(el, ev) {
        var elBounds = el.getBoundingClientRect();
        var pinchCentreX = calcPinchCentre(elBounds, ev.center, 'x', 'width');
        var pinchCentreY = calcPinchCentre(elBounds, ev.center, 'y', 'height');

        el.dataset.pinchCentreX = pinchCentreX;
        el.dataset.pinchCentreY = pinchCentreY;
    }

    function calcPinchCentre(elBounds, pinchCentre, axis, dimension) {
        var elStart = elBounds[axis];
        var elEnd = elBounds[dimension];
        var pinch = pinchCentre[axis];

        var pinchRel = (pinch-elStart)/(elEnd);
        if (pinchRel > 0.75) {
            return 100
        } else if (pinchRel < 0.25) {
            return 0
        } else {
            return Math.round(pinchRel*100);
        }
    }

    function bounceToInitialPosition(el) {
        var currentScale = (el.getBoundingClientRect().width/el.offsetWidth);
        var newScale = currentScale + (1-currentScale)/5;
        if (newScale > 0.99 && newScale < 1.01) {
            lockArticleSwipe(false);
            el.style.transform = 'scale(1)';
            el.classList.remove('touch-gallery__images--pinch');
        } else {
            el.style.transform = 'scale('+newScale+')';
            requestAnimationFrame(function() {
                bounceToInitialPosition(el);
            });
        }
    }
}

function lazyLoadImages() {
    const options = {
        rootMargin: '2000px',
        threshold: 0.01
      };

      const handleIntersection = (entries) => {
        entries.forEach(entry => {
          if (entry.intersectionRatio > 0) {
            entry.target.style.backgroundImage = `url(${entry.target.dataset.src})`;
          }
        })
      }

      const observer = new IntersectionObserver(handleIntersection, options);

      const images = document.querySelectorAll('.touch-gallery__images__image');

      images.forEach(img => {
        observer.observe(img);
      });
}

export { init };
