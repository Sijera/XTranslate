'use strict';

var Chrome = require('./extension/chrome').Chrome,
    Popup = require('./views/popup').Popup,
    THEME = require('./theme'),
    PAYLOAD_ID = 1;

/**
 * @constructor
 */
var UserScript = function () {
    this.extension = new Chrome();
    this.channel = this.extension.connect();
    this.actions = {};
    this.bindEvents();
};

/** @private */
UserScript.prototype.bindEvents = function () {
    this.registerAction('settings', this.onSettings);
    this.registerAction('translate', this.onTranslateText);
    this.extension.onMessage(this.onMessage.bind(this));
    this.channel.onMessage(this.onMessage.bind(this));
};

/** @private */
UserScript.prototype.registerAction = function (name, callback) {
    this.actions[name] = callback.bind(this);
};

/** @private */
UserScript.prototype.sendMessage = function (action, payload) {
    this.channel.sendMessage({
        id     : PAYLOAD_ID++,
        action : action || '',
        payload: payload
    });
};

/** @private */
UserScript.prototype.onMessage = function (msg) {
    var actionName = msg.action;
    if (this.actions[actionName]) this.actions[actionName](msg);
};

/** @private */
UserScript.prototype.onSettings = function (data) {
    this.settings = data;
    console.info(data);
};

/** @private */
UserScript.prototype.onTranslateText = function (data) {
};

// run
new UserScript();