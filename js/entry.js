'use strict';

/**
 * @type App
 * @public
 */
var APP;

/**
 * @type Function
 * @public
 */
var __;

// load and run the app
(function () {
    var App = require('./app').App,
        AppView = require('./views/app_view').AppView;

    APP = new App().on('ready', function () {
        __ = APP.localization;
        new AppView({container: '#app'}).init(APP.state);
    });
})();