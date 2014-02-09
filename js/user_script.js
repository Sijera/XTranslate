'use strict';

var APP = require('./app').create({autoSave: false}),
    Popup = require('./views/popup').Popup;

/**
 * @constructor
 */
var UserScript = function () {
    this.channel = APP.extension.connect();
    this.bindEvents();
};

/** @private */
UserScript.prototype.bindEvents = function () {
    APP.on('ready', this.onReady.bind(this));
    APP.extension.onMessage(this.onMessage.bind(this));
    this.channel.onMessage(this.onMessage.bind(this));
};

/** @private */
UserScript.prototype.onMessage = function (msg) {
    var action = msg.action;
    if (action == 'sync') APP.set(msg.chain, msg.value);
};

/** @private */
UserScript.prototype.playText = function (text) {
    this.channel.sendMessage({action: 'tts', payload: text});
};

/** @private */
UserScript.prototype.onReady = function (state) {
};

// run
var userScript = new UserScript();
global.APP = APP;
global.__ = APP.localization;