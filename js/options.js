'use strict';

/**
 * XTranslate
 * @file options.js
 * @source https://github.com/ixrock/XTranslate
 */

var jQuery = require('./libs/jquery.min'),
    AppView = require('./views/app_view').AppView;

/**
 * @public
 * @type {App}
 */
var APP = require('./app').create().on('ready', function (state) {
    new AppView({container: '#app'}).init(state);
});

global.APP = APP;
global.__ = APP.localization;