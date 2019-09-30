import { getAndroidVersion } from 'modules/util';

function init() {
    lazyLoadImages();
}

function lazyLoadImages() {
    if (parseInt(getAndroidVersion()) === 5) {
        let i;
        const images = document.querySelectorAll('.touch-gallery__images__image');
        for (i = 0; i < images.length; i++) {
            images[i].style.backgroundImage = "url(" + images[i].dataset.src + ")";
        }
        return;
    }

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
