'use strict';

/**
 * XTranslate - options page
 * @url https://github.com/ixrock/XTranslate
 */
var AppView = require('./views/app_view').AppView;

/**
 * @public
 * @type {App}
 */
var APP = require('./app').create().on('ready', function (state) {
    new AppView({container: '#app'}).init(state);
});

global.APP = APP;
global.__ = APP.localization;