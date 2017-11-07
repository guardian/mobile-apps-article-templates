define(function() {
  var observers = Object.create(null);
  var callbacks = Object.create(null);
  var elements = Object.create(null);

  function observe(element, threshold, callback) {
    if (!observers[threshold]) {
      callbacks[threshold] = [callback];
      elements[threshold] = [element];
      observers[threshold] = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            callbacks[threshold].forEach(function (c, index) {
              if (elements[threshold][index] === entry.target) {
                c(entry.intersectionRatio);
              }
            });
          }
        });
      }, { threshold: threshold });
    } else {
      callbacks[threshold].push(callback);
      elements[threshold].push(element);
    }
    observers[threshold].observe(element);
  }

  function unobserve(element, threshold, callback) {
    if (!observers[threshold]) return;

    observers[threshold].unobserve(element);
    
    var idx = callbacks[threshold].indexOf(callback);
    if (idx !== -1) {
      callbacks[threshold].splice(idx, 1);
      elements[threshold].splice(idx, 1);
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