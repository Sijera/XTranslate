'use strict';

/**
 * XTranslate - the background page (entry point)
 * @url https://github.com/ixrock/XTranslate
 */
var APP = require('./app').create({autoSave: false});

/**
 * @constructor
 */
var Background = function () {
    APP.extension.onConnect(this.onConnect.bind(this));
    APP.on('change:settingsContainer.popupDefinitions.contextMenu', this.manageContextMenu, this);
    APP.on('change:settingsContainer.vendorBlock.langFrom', this.refresh, this);
    APP.on('change:settingsContainer.vendorBlock.langTo', this.refresh, this);
    APP.on('ready', this.onReady, this);
};

/** @private */
Background.prototype.onReady = function () {
    this.manageContextMenu();
    this.refresh();
};

/** @private */
Background.prototype.refresh = function () {
    var title = this.getTitle();
    APP.extension.setTitle(title);
    if (this.menuInited) {
        APP.extension.contextMenuUpdate(this.contextMenuId, {title: title});
    }
};

/** @private */
Background.prototype.getTitle = function () {
    var extName = APP.extension.getInfo().name,
        vendor = APP.get('settingsContainer.vendorBlock'),
        from = vendor.langFrom.toUpperCase(),
        to = vendor.langTo.toUpperCase();
    return extName + ' (' + from + ' → ' + to + ')';
};

/** @private */
Background.prototype.onConnect = function (channel) {
    channel.onMessage(this.onMessage.bind(this, channel));
};

/** @private */
Background.prototype.onMessage = function (channel, msg) {
    var payload = msg.payload,
        vendor = APP.getVendor(msg.vendorName, !!msg.next);

    switch (msg.action) {
        case 'play':
            vendor.playText(payload);
            break;

        case 'stop':
            vendor.stopPlaying();
            break;

        case 'translate':
            vendor.translateText(payload).done(function (data) {
                msg.payload = data;
                channel.sendMessage(msg);
            });
            break;
    }
};

/** @private */
Background.prototype.manageContextMenu = function () {
    var useContextMenu = APP.get('settingsContainer.popupDefinitions.contextMenu');
    if (useContextMenu && !this.menuInited) this.initContextMenu();
    if (!useContextMenu && this.menuInited) this.destroyContextMenu();
};

/** @private */
Background.prototype.initContextMenu = function () {
    var pageContexts = ['selection'];
    var contextMenuId = APP.extension.contextMenuCreate({
        id      : 'main',
        title   : this.getTitle(),
        contexts: pageContexts
    });

    APP.vendors.forEach(function (vendor) {
        APP.extension.contextMenuCreate({
            id      : vendor.name,
            title   : __(70, [vendor.title]),
            parentId: contextMenuId,
            contexts: pageContexts
        });
    });

    APP.extension.contextMenuOnClick(this.onContextMenuClick);
    this.menuInited = true;
    this.contextMenuId = contextMenuId;
};

/** @private */
Background.prototype.destroyContextMenu = function () {
    APP.extension.contextMenuRemoveClick(this.onContextMenuClick);
    APP.extension.contextMenuRemoveAll();
    delete this.menuInited;
    delete this.contextMenuId;
};

/** @private */
Background.prototype.onContextMenuClick = function (info, tab) {
    var vendor = APP.getVendor(info.menuItemId);
    vendor.translateText(info.selectionText).done(function (data) {
        APP.extension.sendTabMessage(tab.id, {
            action    : 'translate',
            payload   : data,
            vendorName: vendor.name,
            pageUrl   : info.frameUrl || info.pageUrl
        });
    });
};

// run
if (typeof global == 'undefined') var global = window;
global.APP = APP;
global.__ = APP.localization;
var bgProcess = new Background();