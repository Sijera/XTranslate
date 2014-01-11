'use strict';

/**
 * @type XTranslate
 * @public
 */
var APP;

/**
 * @type Function
 * @public
 */
var __;

(function () {
    var jQueryPlugins = require('./libs/jquery-plugins');
    var XTranslate = require('./app').XTranslate;

    // Create and run extension
    APP = new XTranslate({container: '#app'});
    __ = APP.extension.getText.bind(APP.extension);
    APP.run();
})();
