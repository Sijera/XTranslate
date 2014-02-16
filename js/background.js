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
    var payload = msg.payload;
    switch (msg.action) {
        case 'play':
            APP.vendor.playText(payload);
            break;

        case 'stop':
            APP.vendor.stopPlaying();
            break;

        case 'translate':
            APP.vendor.translateText(payload).done(function (data) {
                msg.payload = data;
                channel.sendMessage(msg);
            });
            break;
    }
};

// run
var bgProcess = new Background();
global.APP = APP;