'use strict';

var APP = require('./app').create({autoSave: false}),
    Popup = require('./views/popup').Popup;

/**
 * @constructor
 */
var UserScript = function () {
    this.channel = APP.extension.connect();
    this.payloadId = 0;
    this.actions = {};
    this.bindEvents();
    this.registerActions();
};

/** @private */
UserScript.prototype.bindEvents = function () {
    APP.extension.onMessage(this.onMessage.bind(this));
    this.channel.onMessage(this.onMessage.bind(this));
};

/** @private */
UserScript.prototype.registerActions = function () {
    this.sync = this.registerAction('sync', this.onSync);
    this.playText = this.registerAction('tts');
    this.translateText = this.registerAction('translate', this.onTranslateText);
};

/** @private */
UserScript.prototype.registerAction = function (name, handler) {
    this.actions[name] = handler;
    return this.sendAction.bind(this, name);
};

/** @private */
UserScript.prototype.sendAction = function (action, payload) {
    this.channel.sendMessage({
        id     : this.payloadId++,
        action : action,
        payload: payload
    });
};

/** @private */
UserScript.prototype.onMessage = function (msg) {
    var action = msg.action;
    if (this.actions[action]) this.actions[action].call(this, msg.payload);
};

/** @private */
UserScript.prototype.onSync = function (data) {
    APP.set(data.chain, data.value);
};

/** @private */
UserScript.prototype.onTranslateText = function (data) {
    console.info(data);
};

// run
var userScript = new UserScript();
global.APP = APP;
global.__ = APP.localization;