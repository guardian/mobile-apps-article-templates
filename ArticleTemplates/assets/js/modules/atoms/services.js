define(function () {
  // Need to pass in the API to native services, something that looks
  // like this: 
  // {
  //    ophan:    { record: function(obj) { ... } },
  //    identity: { ... },
  //    ...
  // }
  return {
    ophan: {
      record: function() {
        console.log("ophan called with:");
        console.dir(arguments);
      }
    },
    dom: {
      write: function(f) { f(); },
      read: function(f)  { f(); }
    },
    viewport: {
      observe: function(element, threshold, callback) {
        var observer = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            callback(entry.intersectionRatio);
          });
        }, { threshold: threshold });
        observer.observe(element);
      },
      unobserve: function() { 
        console.log("Unobserving element...");
      }
    }
  };
})