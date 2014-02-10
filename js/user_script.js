'use strict';

var UTILS = require('./utils'),
    APP = require('./app').create({autoSave: false}),
    Popup = require('./views/popup').Popup;

/**
 * @constructor
 */
var UserScript = function () {
    this.channel = APP.extension.connect();
    this.payloadId = 0;
    this.actions = {};

    this.sync = this.registerAction('sync', this.onSync);
    this.playText = this.registerAction('tts');
    this.translateText = this.registerAction('translate', this.onTranslateText);

    this.createDom();
    this.bindEvents();
    this.applyTheme();
};

/** @private */
Object.defineProperty(UserScript.prototype, 'settings', {
    get: function () {
        return APP.get('settingsContainer.popupDefinitions');
    }
});

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
        .on('linkClick', this.translateText)
        .on('playText', this.playText);

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
    if (this.settings.autoPlay) this.playText();
    this.popup.parseData(data).show();
};

/** @private */
UserScript.prototype.getText = function () {
    return window.getSelection().toString().trim();
};

/** @private */
UserScript.prototype.onKeyDown = function (e) {

};

/** @private */
UserScript.prototype.onMouseUp = function (e) {
    this.translateSelection(e, this.settings.selectAction);
};

/** @private */
UserScript.prototype.onDblClick = function (e) {
    this.translateSelection(e, this.settings.clickAction);
};

/** @private */
UserScript.prototype.translateSelection = function (e, condition) {
    if (!condition || this.popup.$container[0].contains(e.target)) return;
    var text = this.getText();
    if (text) this.translateText(text);
};

// run
global.APP = APP.on('ready', function () { new UserScript() });
global.__ = APP.localization;