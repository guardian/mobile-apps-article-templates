define([
  'modules/atoms/services'
], function (
  services
) {
    'use strict';

    function init() {
      var atomTypes = GU.opts.atoms;
      Object.keys(atomTypes).forEach(function (t) {
        var f = atomTypes[t];
        if ( typeof f.default !== 'function' || f.default.length !== 1 ) {
          return;
        }
        bootAtomType(t, atomTypes[t]);
      });
    }

    function bootAtomType(atomType, atomFactory) {
      var atomBuilder = atomFactory.default(services);
      var atoms = document.querySelectorAll('.element-atom[data-atom-type="' + atomType + '"]');
      for( var i = 0; i < atoms.length; i++ ) {
        var atom = atomBuilder(atoms[i]).runTry();
        if (typeof atom === 'string') {
          console.log('Failed to initialise atom [' + atomType + '/' + atoms[i].getAttribute('data-atom-id') + ']: ' + atom);
        } else {
          atom.start();
        }
      }
    }

    return {
      init: init
    };
});
