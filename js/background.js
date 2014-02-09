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
};

/** @private */
Background.prototype.onConnect = function (channel) {
    channel.onMessage(this.onMessage.bind(this, channel));
};

/** @private */
Background.prototype.onMessage = function (channel, msg) {
    if (msg.action == 'tts') APP.vendor.playText(msg.payload);
};

// run
var bgProcess = new Background();