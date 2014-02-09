'use strict';

/**
 * XTranslate - the background page (entry point)
 * @url https://github.com/ixrock/XTranslate
 */
var APP = require('./app').create();

/**
 * @constructor
 */
var Background = function () {
    APP.extension.onConnect(this.onConnect.bind(this));
};

/** @private */
Background.prototype.onConnect = function (channel) {
    channel.onMessage(this.onMessage.bind(this, channel));
    channel.sendMessage({action: 'settings', payload: APP.state});
};

/** @private */
Background.prototype.onMessage = function (channel, msg) {
    var payload = msg.payload;
    switch (msg.action) {
        case "tts":
            APP.vendor.playText(payload);
            break;

        case "translate":
            APP.vendor.translateText(payload).done(function (payload) {
                msg.payload = payload;
                channel.sendMessage(msg);
            });
            break;
    }
};

// run
new Background();