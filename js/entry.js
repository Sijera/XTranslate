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

// Load and run the app
(function () {
    var App = require('./app').App,
        AppView = require('./views/app_view').AppView,
        appView = new AppView({container: '#app'});

    APP = new App();
    APP.on('ready', appView.init.bind(appView, APP));
    __ = APP.extension.getText.bind(APP.extension);
})();