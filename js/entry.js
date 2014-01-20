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

    // init and export some variables in the global scope
    var appView = new AppView({container: '#app'});
    APP = new App();
    __ = APP.extension.getText.bind(APP.extension);
    APP.on('ready', appView.init.bind(appView, APP));
})();