'use strict';

var inherit = require('../utils').inherit,
    EventDriven = require('../events').EventDriven;

/**
 * @constructor
 */
var Extension = function (options) {
    Extension.superclass.constructor.call(this, options);
    this.stateName = 'state';
};

inherit(Extension, EventDriven);

/** @protected */
Extension.prototype.setState = function (state, onDone) {
    localStorage[this.stateName] = JSON.stringify(state);
    if (typeof onDone == 'function') onDone();
};

/** @protected */
Extension.prototype.getState = function (callback) {
    var state = JSON.parse(localStorage[this.stateName] || null);
    setTimeout(callback.bind(this, state), 0);
};

exports.Extension = Extension;