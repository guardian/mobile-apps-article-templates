define([
  'modules/util',
  'modules/services/viewport'
], function (
  util,
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
      record: function(obj) {
        // Pass obj to native layer be tracked in Ophan
        if (window.GuardianJSInterface && window.GuardianJSInterface.trackComponentEvent) {
            window.GuardianJSInterface.trackComponentEvent(obj);
        } else {
            util.signalDevice('trackComponentEvent/' + JSON.stringify(obj));
        }
      }
    },
    dom: {
      write: function(f) { f(); },
      read: function(f)  { f(); }
    },
    viewport: viewport
  };
})