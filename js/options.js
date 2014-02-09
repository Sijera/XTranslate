'use strict';

/**
 * XTranslate - the options page (entry point)
 * @url https://github.com/ixrock/XTranslate
 */

var AppView = require('./views/app_view').AppView;

/**
 * @public
 * @type App
 */
var APP = global.APP = require('./app').create()
    .on('ready', function (state) {
        this.view = new AppView({container: '#app'}).init(state);
    })
    .on('change', function (data) {
        data.type = 'modelChange';
        APP.extension.broadcastMessage(data);
    });

/** @public */
var __ = global.__ = APP.localization;