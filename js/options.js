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
        // sync the data with the background process page and opened window tabs
        APP.extension.broadcastMessage({action: 'sync', payload: data});
        APP.extension.getBackgroundPage(function (bgcPage) {
            bgcPage.APP.set(data.chain, data.value);
        });
    });

global.APP = APP;
global.__ = APP.localization;