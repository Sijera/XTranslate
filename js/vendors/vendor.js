'use strict';

var inherit = require('../utils').inherit,
    EventDriven = require('../events').EventDriven;

/**
 * Base class for all translation services
 * @constructor
 */
var Vendor = function (options) {
    Vendor.superclass.constructor.call(this, options);

    this.sourceText = '';
    this.autoDetect = 'auto';
    this.textToSpeech = false;
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
 * @param {Object|Array} response
 * @return {*}
 */
Vendor.prototype.parseData = function (response) {
    return response; // override me!
};

/** @protected */
Vendor.prototype.onTranslationReady = function (data) {
    this.trigger('translationReady', data);
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