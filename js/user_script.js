'use strict';

var UTILS = require('./utils'),
    APP = require('./app').create({autoSave: false}),
    Popup = require('./views/popup').Popup;

// run here
APP.on('ready', function () {});

/**
 * @constructor
 */
var UserScript = function () {
    this.channel = APP.extension.connect();
    this.payloadId = 0;
    this.actions = {};
    this.createDom();
    this.bindEvents();
    this.registerActions();
};

/** @private */
UserScript.prototype.createDom = function () {
    this.$app = $('<div id="XTranslate"/>').appendTo(document.body);
    this.popup = new Popup({borderElem: this.$app});
    this.refreshTheme();
    UTILS.spawnElement.$pool.remove();
};

/** @private */
UserScript.prototype.refreshTheme = function () {
    this.popup.applyTheme();
};

/** @private */
UserScript.prototype.bindEvents = function () {
    this.refreshTheme = UTILS.debounce(this.refreshTheme.bind(this), 100);

    this.channel.onMessage(this.onMessage.bind(this));
    APP.extension.onMessage(this.onMessage.bind(this));
    APP.on('change:settingsContainer.popupStyle.activeTheme', this.refreshTheme);
    APP.on('change:settingsContainer.popupStyle.customTheme', this.refreshTheme);
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

global.APP = APP;
global.__ = APP.localization;