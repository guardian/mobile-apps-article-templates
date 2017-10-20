define(function() {
  var observers = Object.create(null);
  var callbacks = Object.create(null);

  function observe(element, threshold, callback) {
    if (!observers[threshold]) {
      callbacks[threshold] = [callback];
      observers[threshold] = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            callbacks[threshold].forEach(function (c) {
              c(entry.intersectionRatio);
            });
          }
        });
      }, { threshold: threshold });
    } else {
      callbacks[threshold].push(callback);
    }
    observers[threshold].observe(element);
  }

  function unobserve(element, threshold, callback) {
    if (!observers[threshold]) return;

    observers[threshold].unobserve(element);
    
    var idx = callbacks[threshold].indexOf(callback);
    if (idx !== -1) {
      callbacks[threshold].splice(idx, 1);
    }

    if (callbacks[threshold].length === 0) {
      observers[threshold] = null;
    }
  }
  
  return {
    observe: observe,
    unobserve: unobserve
  };
});