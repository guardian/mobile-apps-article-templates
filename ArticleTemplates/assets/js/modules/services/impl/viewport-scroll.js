let listening = false;
let elementCount = 0;
const elements = Object.create(null);

function observe(element, threshold, callback) {
  if (!listening) {
    window.addEventListener('scroll', onScroll);
    listening = true;
  }

  elements[threshold] || (elements[threshold] = []);
  elements[threshold].push({ element, callback });
  elementCount += 1;
}

function unobserve(element, threshold, callback) {
  if (!elements[threshold]) return;

  const lengthBefore = elements[threshold].length;
  elements[threshold] = elements[threshold].filter(record => record.element !== element && record.callback !== callback);

  elementCount -= lengthBefore - elements.length;

  if (elementCount === 0) {
    window.removeEventListener('scroll', onScroll);
    listening = false;
  }
}

function onScroll() {
  const viewportHeight = window.innerHeight;

  Object.keys(elements).forEach(threshold => {
    const visibleElements = elements[threshold].forEach(record => {
      const rect = record.element.getBoundingClientRect();
      const isNotHidden =
          rect.top + rect.left + rect.right + rect.bottom !== 0;
      const area = (rect.bottom - rect.top) * (rect.right - rect.left);
      const visibleArea = rect.bottom <= 0
        ? 0
        : rect.top >= viewportHeight
        ? 0
        : (Math.min(viewportHeight, rect.bottom) - Math.max(0, rect.top)) * (rect.right - rect.left);
      const intersectionRatio = visibleArea / area;
      if (isNotHidden && intersectionRatio >= threshold) {
        setTimeout(record.callback, 0, visibleArea);
      }
    });
  });
}

export default { observe, unobserve };