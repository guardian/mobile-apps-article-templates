define(function() {
  var listening = false;
  var elements = Object.create(null);
  var elementCount = 0;

  function observe(element, threshold, callback) {
    if (!listening) {
      window.addEventListener('scroll', onScroll);
    }

    elements[threshold] || (elements[threshold] = []);
    elements[threshold].push({ element: element, callback: callback });
    elementCount += 1;
  }

  function unobserve(element, threshold, callback) {
    if (!elements[threshold]) return;

    var lengthBefore = elements[threshold].length;
    elements[threshold] = elements[threshold].filter(function (record) {
      return record.element !== element && record.callback !== callback;
    });
    
    elementCount -= lengthBefore - elements.length;

    if (elementCount === 0) {
      window.removeEventListener('scroll', onScroll);
    }
  }

  function onScroll() {
    var viewportHeight = window.innerHeight;

    Object.keys(elements).forEach(function (threshold) {
      var visibleElements = elements[threshold].forEach(function (record) {
        var rect = record.element.getBoundingClientRect();
        var isNotHidden =
            rect.top + rect.left + rect.right + rect.bottom !== 0;
        var area = (rect.bottom - rect.top) * (rect.right - rect.left);
        var visibleArea = rect.bottom <= 0
          ? 0
          : rect.top >= viewportHeight
          ? 0
          : (Math.max(viewportHeight, rect.bottom) - Math.min(0, rect.top)) * (rect.right - rect.left);
        if (isNotHidden && visibleArea >= threshold) {
          setTimeout(record.callback, 0, visibleArea);
        }
      });
    });
  }
  
  return {
    observe: observe,
    unobserve: unobserve
  };
});