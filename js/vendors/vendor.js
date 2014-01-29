'use strict';

var inherit = require('../utils').inherit,
    EventDriven = require('../events').EventDriven;

/**
 * Base class for all translation services
 * @constructor
 */
var Vendor = function (__) {
    Vendor.superclass.constructor.call(this);

    this.sourceText = '';
    this.autoDetect = 'auto';
    this.textToSpeech = false;
    this.langList = {};
    this.langList[this.autoDetect] = __(64);
};

inherit(Vendor, EventDriven);

Vendor.prototype.playText = function (text) {
    text = text || this.sourceText;
    if (!this.textToSpeech || !text) return;
    var url = this.getAudioUrl(encodeURIComponent(text));
    this.audio = new Audio(url).play();
};

/**
 * Get url of text-to-speech audio file or stream
 * @param {string} text
 * @return {string}
 */
Vendor.prototype.getAudioUrl = function (text) {
    return text; // override me!
};

/**
 * Parse response of the translation and convert it to internal format
 * @param {String} response Received data from the server
 */
Vendor.prototype.parseData = function (response) {
    return {
        // override me!
        sourceText: this.sourceText
    };
};

/**
 * Get current selected languages
 * @return {{from: String, to: String}}
 */
Vendor.prototype.getLangPair = function () {
    var vendorBlock = APP.get('settingsContainer.vendorBlock');
    return {
        from: vendorBlock.langFrom,
        to  : vendorBlock.langTo
    };
};

exports.Vendor = Vendor;