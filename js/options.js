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
var APP = require('./app').create()
    .on('ready', function (state) {
        this.view = new AppView({container: '#app'}).init(state);
    })
    .on('change', function (data) {
        data = $.extend({action: 'sync'}, data);
        APP.extension.broadcastMessage(data);
    });

/** @public */
var __;

global.APP = APP;
global.__ = APP.localization;