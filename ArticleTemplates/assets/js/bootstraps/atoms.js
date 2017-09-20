define([
], function (
) {
    'use strict';

    function init() {
      var atomTypes = GU.opts.atoms;
      Object.keys(atomTypes).forEach(function (t) {
        bootAtomType(t, atomTypes[t]);
      });
    }

    function bootAtomType(atomType, atomFactory) {
      // Need to pass in the API to native services, something that looks
      // like this: 
      // {
      //    ophan:    { record: function(obj) { ... } },
      //    identity: { ... },
      //    ...
      // }
      var atomBuilder = atomFactory.default({
        ophan: {
          record: function() {
            console.log("ophan called with:");
            console.dir(arguments);
          }
        }
      });
      var atoms = document.querySelectorAll('[data-atom-type="' + atomType + '"]');
      for( var i = 0; i < atoms.length; i++ ) {
        var atom = atomBuilder(atoms[i]).runTry();
        atom.start();
      }
    }

    return {
      init: init
    };
});
