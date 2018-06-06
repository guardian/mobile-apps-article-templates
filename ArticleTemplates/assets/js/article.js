import { init as commonInit } from 'bootstraps/common';
import { init as articleInit } from 'bootstraps/article';
import { init as atomsInit } from 'bootstraps/atoms';

const init = () => {
    commonInit();
    articleInit();
    atomsInit();
}

export {
    init,
};

// define([
// 	'bootstraps/common',
//     'bootstraps/article',
//     'bootstraps/atoms'
// ], function (
// 	common,
//     article,
//     atoms
// ) {
//     'use strict';
    
//     function init() {
//         common.init();
//         article.init();
//         atoms.init();
//     }

//     return {
//         init: init
//     };
// });
