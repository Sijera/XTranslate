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

/**
 * Make http request to get local or remote file (must be allowed in manifest.json)
 * @param options jQuery.ajax options
 * @returns {jQuery.Deferred}
 */
Extension.prototype.makeRequest = function (options) {
    return $.ajax(options);
};

/**
 * Get current state of the extension
 * @returns {jQuery.Deferred}
 */
Extension.prototype.loadState = function () {
    var def = $.Deferred();
    this.getState(this.onLoadState.bind(this, def));
    return def;
};

/**
 * Save a state of settings for the extension
 * @param {Object} state
 */
Extension.prototype.saveState = function (state) {
    localStorage[this.stateName] = JSON.stringify(state);
    this.onSaveState();
};

/** @protected */
Extension.prototype.getState = function (callback) {
    var state = JSON.parse(localStorage[this.stateName] || null);
    callback(state);
};

Extension.prototype.removeState = function () {
    delete localStorage[this.stateName];
};

/** @protected */
Extension.prototype.onLoadState = function (def, state) {
    def.resolve(state);
    this.trigger('load', state);
};

/** @protected */
Extension.prototype.onSaveState = function () {
    this.trigger('save');
};

exports.Extension = Extension;