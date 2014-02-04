'use strict';

var inherit = require('../utils').inherit,
    EventDriven = require('../events').EventDriven;

/**
 * @interface
 */
var Extension = function (options) {
    Extension.superclass.constructor.call(this, options);
    this.stateName = 'state';
};

inherit(Extension, EventDriven);

/** @protected */
Extension.prototype.setState = function (state) {
    localStorage[this.stateName] = JSON.stringify(state);
};

/** @protected */
Extension.prototype.getState = function (callback) {
    var state = JSON.parse(localStorage[this.stateName] || null);
    callback(state);
};

exports.Extension = Extension;