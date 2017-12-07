define([
  'modules/util',
  'modules/services/viewport'
], function (
  util,
  viewport
) {
  // Source: https://github.com/guardian/ophan/blob/master/event-model/src/main/thrift/componentevent.thrift
  var actions = {
    INSERT: 1,
    VIEW: 2,
    EXPAND: 3,
    LIKE: 4,
    DISLIKE: 5,
    SUBSCRIBE: 6,
    ANSWER: 7,
    VOTE: 8,
    CLICK: 9
  };

  var componentTypes = {
    READERS_QUESTIONS_ATOM: 1,
    QANDA_ATOM: 2,
    PROFILE_ATOM: 3,
    GUIDE_ATOM: 4,
    TIMELINE_ATOM: 5,
    NEWSLETTER_SUBSCRIPTION: 6,
    SURVEYS_QUESTIONS: 7,
    ACQUISITIONS_EPIC: 8,
    ACQUISITIONS_ENGAGEMENT_BANNER: 9,
    ACQUISITIONS_THANK_YOU_EPIC: 10,
    ACQUISITIONS_HEADER: 11,
    ACQUISITIONS_FOOTER: 12,
    ACQUISITIONS_INTERACTIVE_SLICE: 13,
    ACQUISITIONS_NUGGET: 14,
    ACQUISITIONS_STANDFIRST: 15,
    ACQUISITIONS_THRASHER: 16,
    ACQUISITIONS_EDITORIAL_LINK: 17,
    ACQUISITIONS_MANAGE_MY_ACCOUNT: 18,
    ACQUISITIONS_BUTTON: 19,
    ACQUISITIONS_OTHER: 20
  };

  // Temporary fix:
  // Enums are coming as strings, e.g. PROFILE_ATOM
  // and need to be converted into their number
  // equivalent in order to be processed by the apps
  // correctly
  function convertEnums(obj) {
    if (!'componentEvent' in obj) return obj;
    if (!'component' in obj.componentEvent) return obj;
    var newObj = JSON.parse(JSON.stringify(obj));
    newObj.componentEvent.action = actions[obj.componentEvent.action];
    newObj.componentEvent.component.componentType =
      componentTypes[obj.componentEvent.component.componentType];
    return newObj;
  }

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
        var newObj = convertEnums(obj);
        // Pass obj to native layer be tracked in Ophan
        if (window.GuardianJSInterface && window.GuardianJSInterface.trackComponentEvent) {
            window.GuardianJSInterface.trackComponentEvent(newObj);
        } else {
            util.signalDevice('trackComponentEvent/' + encodeURIComponent(JSON.stringify(newObj)));
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