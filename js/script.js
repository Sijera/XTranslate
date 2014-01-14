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
    var XTranslate = require('./app').XTranslate;
    APP = new XTranslate({container: '#app'});
    __ = APP.extension.getText.bind(APP.extension);
    APP.run();
})();
