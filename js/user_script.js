'use strict';

var UTILS = require('./utils'),
    APP = require('./app').create({autoSave: false}),
    Popup = require('./views/popup').Popup;

/**
 * @constructor
 */
var UserScript = function () {
    var links = APP.get('settingsContainer.siteExclusions.links') || [];
    var urlExcluded = links.some(function (urlMask) {
        urlMask = UTILS.escapeReg(urlMask, '*').replace(/\*/g, '[^/]+');
        return new RegExp(urlMask, 'i').test(document.URL);
    });
    if (!urlExcluded) this.inject();
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
UserScript.prototype.inject = function () {
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
    this.$app = $('<app id="XTranslate"/>').appendTo(document.documentElement);
    this.$icon = $('<icon class="showPopup fa-gear"/>').hide().appendTo(this.$app);
    this.hideIcon = this.$icon.hide.bind(this.$icon);
    this.popup = new Popup({borderElem: this.$app});
    UTILS.spawnElement.$pool.detach();
};

/** @private */
UserScript.prototype.bindEvents = function () {
    var applyTheme = UTILS.debounce(this.applyTheme.bind(this), 200);

    APP.on('change:settingsContainer.popupStyle.activeTheme', applyTheme);
    APP.on('change:settingsContainer.popupStyle.customTheme', applyTheme);
    APP.extension.onMessage(this.onMessage.bind(this));

    this.popup
        .on('show', this.onShowPopup.bind(this))
        .on('hide', this.onHidePopup.bind(this))
        .on('linkClick', this.onLinkClick.bind(this))
        .on('playText', this.onPlayText.bind(this));

    $(window)
        .on('mouseup', UTILS.debounce(this.onMouseUp.bind(this), 0))
        .on('contextmenu', this.onContextMenu.bind(this))
        .on('mousedown', this.onMouseDown.bind(this))
        .on('mouseover', this.onMouseOver.bind(this))
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
        id        : this.payloadId++,
        vendorName: this.lastActiveVendor || APP.vendor.name,
        action    : action,
        payload   : payload
    });
};

/** @private */
UserScript.prototype.onMessage = function (msg) {
    this.lastActiveVendor = msg.vendorName;
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
    this.refreshRange();
    this.popup.parseData(data).show();
    this.popup.setAnchor(this.$app);
    this.reselectText();
};

/** @private */
UserScript.prototype.refreshRange = function () {
    this.lastRange = !this.selection.isCollapsed && this.selection.getRangeAt(0);
    return this.lastRange;
};

/** @private */
UserScript.prototype.getText = function (text) {
    return (text || this.selection.toString()).trim();
};

/** @private */
UserScript.prototype.getOverText= function () {
    var overNode = this.overNode,
        text = this.getText(),
        notBody = overNode !== document.body && overNode !== document.documentElement;

    // Attempt to get text from element under the mouse cursor (in case when nothing selected)
    if (!text && overNode && notBody && this.isOutside(overNode)) {
        var nodeName = overNode.nodeName.toLowerCase();
        if (nodeName == 'textarea' || nodeName == 'input') text = overNode.value || overNode.placeholder;
        else if (nodeName === 'img') text = overNode.title || overNode.alt;
        else text = overNode.innerText || overNode.title;

        var range = new Range();
        overNode.childNodes.length ? range.selectNodeContents(overNode) : range.selectNode(overNode);
        if (text) this.selection.addRange(range);
        this.popup.setAnchor(overNode);
    }

    return text;
};

/** @protected */
UserScript.prototype.getFocusPoint = function () {
    var range = this.refreshRange();
    if (range) {
        var s = this.selection,
            clientRects = $.makeArray(range.getClientRects()),
            anchorOffset = s.anchorOffset,
            focusOffset = s.focusOffset;

        if (s.anchorNode !== s.focusNode) {
            var parentText = range.commonAncestorContainer.textContent;
            anchorOffset = parentText.indexOf(s.anchorNode.textContent);
            focusOffset = parentText.indexOf(s.focusNode.textContent);
        }

        // normalize rect
        var rect = $.extend({}, anchorOffset < focusOffset ? clientRects.pop() : clientRects.shift());
        rect.left += window.pageXOffset;
        rect.top += window.pageYOffset;
        rect.right = rect.left + rect.width;
        rect.bottom = rect.top + rect.height;

        return {
            rect: rect,
            isLeftTop: anchorOffset > focusOffset,
            isRightBottom: anchorOffset < focusOffset
        };
    }
};


/** @private */
UserScript.prototype.onContextMenu = function (e) {
    if (this.restoreSelection) {
        delete this.restoreSelection;
        this.reselectText();
    }
};

/** @private */
UserScript.prototype.onKeyDown = function (e) {
    if (this.settings.keyAction) {
        var keyMatch = this.settings.hotKey == UTILS.getHotkey(e);
        if (keyMatch) {
            this.translateText(e, this.getOverText());
            e.preventDefault();
        }
    }
};
/** @private */
UserScript.prototype.onMouseDown = function (e) {
    var targetElem = e.target;
    if (e.button === 2 /*RIGHT*/) {
        if (this.settings.contextMenu && this.getText()) {
            this.restoreSelection = true;
        }
    }
    else if (this.lastRange && this.isOutside(targetElem)) {
        if (this.settings.showActionIcon) {
            if (this.$icon.is(targetElem)) {
                this.showIconClicked = true;
                this.translateText(e);
                e.preventDefault();
            }
            this.hideIcon();
        }
        delete this.lastRange;
    }
};

/** @private */
UserScript.prototype.onMouseUp = function (e) {
    if (this.clickAction) {
        // avoid attempts of getting translation twice, if double-click was used
        delete this.clickAction;
        return;
    }

    if (this.showIconClicked) {
        // don't try to show the icon again, if we click on it
        delete this.showIconClicked;
        return;
    }

    if (this.settings.showActionIcon && this.popup.hidden && this.isOutside(e.target)) {
        var point = this.getFocusPoint();
        if (point) {
            var isLeftTop = point.isLeftTop;
            this.$icon.show().toggleClass('leftTop', isLeftTop);
            this.$icon.css({
                left: point.rect[isLeftTop ? 'left' : 'right'],
                top : point.rect[isLeftTop ? 'top' : 'bottom']
            });
        }
    }

    if (this.settings.selectAction && !this.isEditable(e.target)) {
        this.translateText(e);
    }
};

/** @private */
UserScript.prototype.onDblClick = function (e) {
    if (this.settings.clickAction && !this.isEditable(e.target)) {
        this.clickAction = true;
        this.translateText(e);
    }
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
UserScript.prototype.onPlayText = function () {
    this.playTextAction();
    this.reselectText();
};

/** @private */
UserScript.prototype.onShowPopup = function () {
    if (this.settings.autoFocus) this.popup.focus();
    if (this.settings.showActionIcon) this.hideIcon();
};

/** @private */
UserScript.prototype.onHidePopup = function () {
    this.selection.removeAllRanges();
    this.stopPlayingAction();
    delete this.lastActiveVendor;
};

/** @private */
UserScript.prototype.isOutside = function (elem) {
    // Make sure the target is outside of the popup
    return !this.popup.$container[0].contains(elem);
};

/** @private */
UserScript.prototype.isEditable = function (elem) {
    // In case if double click or mouse-up action happened inside the editable form field,
    // like <textarea>, don't handle the event.
    return elem === document.activeElement;
};

/** @private */
UserScript.prototype.translateText = function (e, text) {
    if ((text = this.getText(text)) && this.isOutside(e.target)) {
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