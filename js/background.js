'use strict';

/**
 * XTranslate - the background page (entry point)
 * @url https://github.com/ixrock/XTranslate
 */
var APP = require('./app').create({autoSave: false});

// fix: doesn't applies from the manifest
APP.extension.setIcon('img/icons/16.png');

/**
 * @constructor
 */
var Background = function () {
    APP.extension.onConnect(this.onConnect.bind(this));
    APP.on('change:settingsContainer.vendorBlock.langFrom', this.refresh, this);
    APP.on('change:settingsContainer.vendorBlock.langTo', this.refresh, this);
    APP.on('ready', this.refresh, this);
};

/** @private */
Background.prototype.refresh = function () {
    var vendor = APP.get('settingsContainer.vendorBlock'),
        from = vendor.langFrom.toUpperCase(),
        to = vendor.langTo.toUpperCase();
    APP.extension.setTitle('XTranslate (' + from + ' → ' + to + ')');
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
            var prevReq = this.transTextReq;
            if (prevReq && prevReq.state() == 'pending') prevReq.reject('stop waiting previous request');
            this.transTextReq = APP.vendor.translateText(payload).done(function (data) {
                msg.payload = data;
                channel.sendMessage(msg);
            });
            break;
    }
};

// run
var bgProcess = new Background();
if (typeof global !== 'undefined') global.APP = APP;