'use strict';

var inherit = require('../utils').inherit,
    Extension = require('./extension').Extension;

/**
 * Google Chrome Extensions API wrapper
 * @constructor
 */
var Chrome = function (options) {
    Chrome.superclass.constructor.call(this, options);
    this.url = 'chrome://extensions?id=' + chrome.runtime.id;
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

Chrome.prototype.getURL = function (path) {
    return chrome.runtime.getURL(path);
};

Chrome.prototype.getInfo = function () {
    return chrome.runtime.getManifest();
};

Chrome.prototype.getBackgroundPage = function (callback) {
    chrome.runtime.getBackgroundPage(callback);
};

/**
 * Make a connection (communication channel) between the background process and the content scripts
 * @param {String} [channelName]
 * @return {{port: Port, sendMessage: Function, onMessage: Function, onDisconnect: Function}}
 */
Chrome.prototype.connect = function (channelName) {
    var port = chrome.runtime.connect({name: channelName || ''});
    return this.createChannel(port);
};

/**
 * Add event listener for getting messages from the content scripts
 * @param {Function} callback
 */
Chrome.prototype.onConnect = function (callback) {
    chrome.runtime.onConnect.addListener(function (port) {
        callback(this.createChannel(port));
    }.bind(this));
};

/** @private */
Chrome.prototype.createChannel = function (port) {
    var channel = {port: port};
    channel.sendMessage = this.sendMessage;
    channel.onMessage = this.onChannelMessage;
    channel.onDisconnect = this.onChannelDisconnect;
    channel.disconnect = port.disconnect.bind(port);
    return channel;
};

/** @private */
Chrome.prototype.sendMessage = function (msg) {
    this.port.postMessage(msg);
};

/** @private */
Chrome.prototype.onChannelMessage = function (callback) {
    this.port.onMessage.addListener(callback);
};

/** @private */
Chrome.prototype.onChannelDisconnect = function (callback) {
    this.port.onDisconnect.addListener(callback);
};

Chrome.prototype.onMessage = function (callback) {
    chrome.runtime.onMessage.addListener(callback);
};

Chrome.prototype.broadcastMessage = function (msg) {
    chrome.tabs.query({}, function (tabs) {
        tabs.forEach(function (tab) {
            chrome.tabs.sendMessage(tab.id, msg);
        });
    });
};

/**
 * Save current state of the app
 * @param {Object} state
 * @param {Function} [onDone]
 */
Chrome.prototype.setState = function (state, onDone) {
    var items = {};
    items[this.stateName] = state;
    chrome.storage.local.set(items, onDone);
};

/**
 * Get last saved state of the app (async)
 * @param callback
 */
Chrome.prototype.getState = function (callback) {
    var itemName = this.stateName;
    chrome.storage.local.get(itemName, function (items) {
        callback(items[itemName]);
    });
};

exports.Chrome = Chrome;