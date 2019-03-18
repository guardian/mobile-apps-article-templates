import Hammer from 'hammerjs';

function init() {
    lazyLoadImages();
    const galleryImages = document.querySelectorAll('.touch-gallery__images');
    const hammerSettings = (GU.opts.platform === 'ios' ? { touchAction: 'auto' } : {})

    galleryImages.forEach(galleryImage => {
        const mc = new Hammer.Manager(galleryImage, hammerSettings);
        const pinch = new Hammer.Pinch();

        mc.add(pinch);

        mc.on('pinch', ev => {
            if (GU.opts.platform === 'ios') {
                ev.preventDefault();
            }

            const desiredScale = ev.scale;
            const pinchCentre = getPinchCentre(galleryImage);

            galleryImage.style.transformOrigin = `${pinchCentre.x}% ${pinchCentre.y}%`;
            galleryImage.style.transform = `scale(${desiredScale})`;
        });

        mc.on('pinchstart', ev => {
            galleryImage.classList.add('touch-gallery__images--pinch');
            lockArticleSwipe(true);
            savePinchCentre(galleryImage, ev);
        });

        mc.on('pinchend', () => {
            lockArticleSwipe(false);
            bounceToInitialPosition(galleryImage);
        });

    });

    function lockArticleSwipe(toggle) {
        if (GU.opts.platform === 'android') {
            window.GuardianJSInterface.registerRelatedCardsTouch(toggle);
        }
    }

    function getPinchCentre({dataset}) {
        const pinchX = dataset.pinchCentreX;
        const pinchY = dataset.pinchCentreY;
        return {x: pinchX, y: pinchY};
    }

    function savePinchCentre(el, {center}) {
        const elBounds = el.getBoundingClientRect();
        const pinchCentreX = calcPinchCentre(elBounds, center, 'x', 'width');
        const pinchCentreY = calcPinchCentre(elBounds, center, 'y', 'height');

        el.dataset.pinchCentreX = pinchCentreX;
        el.dataset.pinchCentreY = pinchCentreY;
    }

    function calcPinchCentre(elBounds, pinchCentre, axis, dimension) {
        const elStart = elBounds[axis];
        const elEnd = elBounds[dimension];
        const pinch = pinchCentre[axis];

        const pinchRel = (pinch-elStart)/(elEnd);
        if (pinchRel > 0.75) {
            return 100
        } else if (pinchRel < 0.25) {
            return 0
        } else {
            return Math.round(pinchRel*100);
        }
    }

    function bounceToInitialPosition(el) {
        const currentScale = (el.getBoundingClientRect().width/el.offsetWidth);
        const newScale = currentScale + (1-currentScale)/5;
        if (newScale > 0.99 && newScale < 1.01) {
            lockArticleSwipe(false);
            el.style.transform = 'scale(1)';
            el.classList.remove('touch-gallery__images--pinch');
        } else {
            el.style.transform = `scale(${newScale})`;
            requestAnimationFrame(() => {
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
        entries.forEach(({intersectionRatio, target}) => {
          if (intersectionRatio > 0) {
            target.style.backgroundImage = `url(${target.dataset.src})`;
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
