'use strict';

var UTILS = require('./utils'),
    APP = require('./app').create({autoSave: false}),
    Popup = require('./views/popup').Popup;

/**
 * @constructor
 */
var UserScript = function () {
    var links = APP.get('settingsContainer.siteExclusions.links') || [];
    var excluded = links.some(function (urlMask) {
        urlMask = UTILS.escapeReg(urlMask, '*').replace(/\*/g, '[^/]+');
        return new RegExp(urlMask, 'i').test(document.URL);
    });
    if (!excluded) this.init();
};

Object.defineProperty(UserScript.prototype, 'channel', {
    get: function () {
        if (this._channel) return this._channel;
        this._channel = APP.extension.connect();
        this._channel.onMessage(this.onMessage.bind(this));
        this._channel.onDisconnect(function () { delete this._channel }.bind(this));
        return this._channel;
    }
});

/** @private */
UserScript.prototype.init = function () {
    this.settings = APP.get('settingsContainer.popupDefinitions');
    this.selection = window.getSelection();
    this.payloadId = 0;
    this.actions = {};
    this._channel = null;

    this.playTextAction = this.registerAction('play');
    this.stopPlayingAction = this.registerAction('stop');
    this.syncAction = this.registerAction('sync', this.onSync);
    this.translateAction = this.registerAction('translate', this.onTranslateText);

    this.createDom();
    this.bindEvents();
    this.applyTheme();
};

/** @private */
UserScript.prototype.createDom = function () {
    this.$app = $('<div id="XTranslate" data-url="' + APP.extension.url + '"></div>').appendTo(document.body);
    this.popup = new Popup({borderElem: this.$app});
    UTILS.spawnElement.$pool.detach();
};

/** @private */
UserScript.prototype.bindEvents = function () {
    var applyTheme = UTILS.debounce(this.applyTheme.bind(this), 200);

    APP.extension.onMessage(this.onMessage.bind(this));
    APP.on('change:settingsContainer.popupStyle.activeTheme', applyTheme);
    APP.on('change:settingsContainer.popupStyle.customTheme', applyTheme);

    this.popup
        .on('hide', this.onHidePopup.bind(this))
        .on('linkClick', this.onLinkClick.bind(this))
        .on('playText', this.playTextAction);

    $(window)
        .on('resize', UTILS.debounce(this.onResize.bind(this), 300))
        .on('mouseover', UTILS.debounce(this.onMouseOver.bind(this), 100))
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
    this.popup.parseData(data).setAnchor(this.$app).show();
    this.reselectText();
};

/** @private */
UserScript.prototype.getText = function (text) {
    return (text || this.selection.toString()).trim();
};

/** @private */
UserScript.prototype.autoDetectText= function (e) {
    var overNode = this.overNode,
        text = this.getText(),
        isTopLevel = overNode == document.documentElement || overNode == document.body;

    // Receive the text from element under the mouse cursor (if not text selected)
    if (!text && !isTopLevel && overNode && this.outOfPopup(overNode)) {
        var nodeName = overNode.nodeName.toLowerCase();
        if (nodeName == 'textarea' || nodeName == 'input') text = overNode.value || overNode.placeholder;
        else if (nodeName === 'img') text = overNode.title || overNode.alt;
        else text = overNode.innerText;

        var range = new Range();
        var texts = UTILS.evalXPath(overNode, './/text()');
        if (!texts.length) range.selectNode(overNode);
        else texts.forEach(function (textNode) {
            range.selectNode(textNode);
        });

        this.selection.removeAllRanges();
        this.selection.addRange(range);
        this.popup.setAnchor(overNode);
    }
    return text;
};

/** @private */
UserScript.prototype.onKeyDown = function (e) {
    if (this.settings.keyAction) {
        var keyMatch = this.settings.hotKey == UTILS.getHotkey(e).join('+');
        if (keyMatch) {
            var text = this.settings.autoDetection ? this.autoDetectText(e) : this.getText();
            this.translateText(e, text);
        }
    }
};

/** @private */
UserScript.prototype.onMouseUp = function (e) {
    if (this.mouseActionUsed) {
        delete this.mouseActionUsed;
        return;
    }
    if (this.settings.selectAction && !this.isActiveElem(e.target)) {
        this.translateText(e);
    }
};

/** @private */
UserScript.prototype.onDblClick = function (e) {
    if (this.settings.clickAction && !this.isActiveElem(e.target)) {
        this.mouseActionUsed = true;
        this.translateText(e);
    }
};

/** @private */
UserScript.prototype.onResize = function (e) {
    this.popup.update();
};

/** @private */
UserScript.prototype.onMouseOver = function (e) {
    this.overNode = e.target;
};

/** @private */
UserScript.prototype.onLinkClick = function (text) {
    this.translateAction(text);
    this.reselectText();
};

/** @private */
UserScript.prototype.onHidePopup = function () {
    this.selection.removeAllRanges();
    this.stopPlayingAction();
};

/** @private */
UserScript.prototype.outOfPopup = function (targetElem) {
    return !this.popup.$container[0].contains(targetElem);
};

/** @private */
UserScript.prototype.isActiveElem = function (elem) {
    return elem === document.activeElement;
};

/** @private */
UserScript.prototype.translateText = function (e, text) {
    text = this.getText(text);
    if (text && this.outOfPopup(e.target)) {
        this.lastRange = !this.selection.isCollapsed && this.selection.getRangeAt(0);
        this.translateAction(text);
    }
};

/** @private */
UserScript.prototype.reselectText = function () {
    if (!this.lastRange) return;
    this.selection.removeAllRanges();
    this.selection.addRange(this.lastRange);
};

// run
global.APP = APP.on('ready', function () { new UserScript() });
global.__ = APP.localization;