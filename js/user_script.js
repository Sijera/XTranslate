'use strict';

var UTILS = require('./utils'),
    APP = require('./app').create({autoSave: false}),
    Popup = require('./views/popup').Popup;

/**
 * @constructor
 */
var UserScript = function () {
    this.settings = APP.get('settingsContainer.popupDefinitions');
    this.channel = APP.extension.connect();
    this.selection = window.getSelection();
    this.payloadId = 0;
    this.actions = {};

    this.syncAction = this.registerAction('sync', this.onSync);
    this.playTextAction = this.registerAction('tts');
    this.translateAction = this.registerAction('translate', this.onTranslateText);

    this.createDom();
    this.bindEvents();
    this.applyTheme();
};

/** @private */
UserScript.prototype.createDom = function () {
    this.$app = $('<div id="XTranslate" data-url="' + APP.extension.url + '"></div>').appendTo(document.body);
    this.popup = new Popup({borderElem: this.$app, anchor: this.$app});
    UTILS.spawnElement.$pool.detach();
};

/** @private */
UserScript.prototype.bindEvents = function () {
    var applyTheme = UTILS.debounce(this.applyTheme.bind(this), 250);

    this.channel.onMessage(this.onMessage.bind(this));
    APP.extension.onMessage(this.onMessage.bind(this));
    APP.on('change:settingsContainer.popupStyle.activeTheme', applyTheme);
    APP.on('change:settingsContainer.popupStyle.customTheme', applyTheme);

    this.popup
        .on('hide', this.cleanUpRanges.bind(this))
        .on('linkClick', this.onLinkClick.bind(this))
        .on('playText', this.playTextAction);

    $(window)
        .on('mouseup', UTILS.debounce(this.onMouseUp.bind(this), 0))
        .on('dblclick', this.onDblClick.bind(this))
        .on('keydown', this.onKeyDown.bind(this));
};

/** @private */
UserScript.prototype.applyTheme = function () {
    this.popup.applyTheme();
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
    if (this.settings.autoPlay) this.playTextAction();
    this.popup.parseData(data).show();
    this.reselectText();
};

/** @private */
UserScript.prototype.getText = function () {
    return this.selection.toString().trim();
};

/** @private */
UserScript.prototype.onKeyDown = function (e) {

};

/** @private */
UserScript.prototype.onMouseUp = function (e) {
    if (this.clickActionUsed) return (delete this.clickActionUsed);
    if (this.settings.selectAction) this.translateText(e);
    return true;
};

/** @private */
UserScript.prototype.onDblClick = function (e) {
    if (this.settings.clickAction) {
        this.clickActionUsed = true;
        this.translateText(e);
    }
};

/** @private */
UserScript.prototype.onLinkClick = function (text) {
    this.translateAction(text);
    this.reselectText();
};

/** @private */
UserScript.prototype.translateText = function (e) {
    var text = this.getText();
    var outOfPopup = !this.popup.$container[0].contains(e.target);
    if (text && outOfPopup) {
        this.lastRange = !this.selection.isCollapsed && this.selection.getRangeAt(0);
        this.translateAction(text);
    }
};

/** @private */
UserScript.prototype.cleanUpRanges = function () {
    this.selection.removeAllRanges();
};

/** @private */
UserScript.prototype.reselectText = function () {
    if (!this.lastRange) return;
    this.cleanUpRanges();
    this.selection.addRange(this.lastRange);
};

// run
global.APP = APP.on('ready', function () { new UserScript() });
global.__ = APP.localization;