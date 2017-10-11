define([
  'modules/services/viewport'
], function (
  viewport
) {
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
    viewport: viewport
  };
})