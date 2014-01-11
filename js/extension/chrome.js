'use strict';

var inherit = require('../utils').inherit,
    Extension = require('./extension').Extension;

/**
 * @constructor
 */
var Chrome = function (options) {
    Chrome.superclass.constructor.call(this, options);
};

inherit(Chrome, Extension);

/**
 * Get a localized string
 * @param {String|Number} messageName The name of the message, as specified in the messages.json file
 * @param {Array.<String>} [substitutions] Up to 9 substitution strings, if the message requires any
 * @returns String
 */
Chrome.prototype.getText = function (messageName, substitutions) {
    messageName = String(messageName);
    return chrome.i18n.getMessage(messageName, substitutions);
};

/**
 * Get full url to file with extension protocol
 * @param {String} path
 * @returns String
 */
Chrome.prototype.getURL = function (path) {
    return chrome.extension.getURL(path);
};

Chrome.prototype.getImageURL = function (path) {
    return 'url(' + this.getURL(path) + ')';
};

/**
 * Get basic info about extension
 * @returns {{name: string, version: string, description: string=}}
 */
Chrome.prototype.getInfo = function () {
    var info = chrome.runtime.getManifest();
    return {
        name       : info.name,
        version    : info.version,
        description: info.description
    };
};

/** @protected */
Chrome.prototype.getState = function (callback) {
    var itemName = this.stateName;
    chrome.storage.local.get(itemName, function (items) {
        callback(items[itemName]);
    });
};

Chrome.prototype.saveState = function (state) {
    var items = {};
    items[this.stateName] = state;
    chrome.storage.local.set(items, this.onSaveState.bind(this));
};

Chrome.prototype.removeState = function () {
    chrome.storage.local.remove(this.stateName);
};

exports.Chrome = Chrome;