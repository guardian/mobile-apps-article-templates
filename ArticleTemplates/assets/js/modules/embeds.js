/*global window,console,define */
define([
    'modules/$'
], function (
    $
) {
    'use strict';

    var modules = {
    	removeIFrames: function(){
    		//$('iframe').hide();
    	}
    };

    var	ready = function () {
        if (!this.initialised) {
            this.initialised = true;
            modules.removeIFrames();
        }
    };

    return {
        init: ready
    };
});