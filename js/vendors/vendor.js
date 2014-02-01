'use strict';

var UTILS = require('../utils'),
    inherit = require('../utils').inherit,
    EventDriven = require('../events').EventDriven;

// TODO: add errors handling!

/**
 * Base class for all translation services
 * @constructor
 */
var Vendor = function (__) {
    Vendor.superclass.constructor.call(this);

    this.autoDetect = 'auto';
    this.urlTextToSpeech = '';
    this.lastResData = {};
    this.lastReqData = {text: '', langFrom: '', langTo: ''};
    this.langList = {};
    this.langList[this.autoDetect] = __(64);
};

inherit(Vendor, EventDriven);

Vendor.prototype.translateText = function (text) {
    this.swapped = false;
    return this.loadData({text: text});
};

/**
 * Create ajax request with provided arguments for getting translation data
 * @param {{langFrom: String=, langTo: String=, text: String}} data
 * @return {jQuery.Deferred}
 */
Vendor.prototype.makeRequest = function (data) {
    // must be overridden!
    return $.Deferred();
};

/** @protected */
Vendor.prototype.loadData = function (data) {
    data = $.extend(this.lastReqData, this.getLangPair(), data);

    return this.makeRequest(data)
        .then(this.parseData.bind(this))
        .then(this.autoSwapLang.bind(this));
};

/**
 * Parse response from server and convert the data to internal format for the app views
 * @see VendorDataView.parseData for the details about possible data returning from vendor
 * @param {Object} response
 */
Vendor.prototype.parseData = function (response) {
    this.lastResData = response;
    var ttsEnabled = !!this.getAudioUrl(this.lastReqData.text, this.lastResData.langSource);
    return $.extend({ttsEnabled: ttsEnabled}, response);
};

/** @protected */
Vendor.prototype.autoSwapLang = function (parsedData) {
    if (this.swapped) return parsedData;

    var langPair = this.getLangPair(),
        langFrom = langPair.langFrom,
        langTo = langPair.langTo,
        langSource = parsedData.langSource,
        langDetected = parsedData.langDetected;

    if (langDetected && langDetected !== langSource && langFrom !== this.autoDetect) {
        this.swapped = true;
        return this.loadData({
            langFrom: langDetected,
            langTo  : langDetected !== langFrom ? langFrom : langTo
        });
    }
    return parsedData;
};

Vendor.prototype.playText = function (text, lang) {
    text = text || this.lastReqData.text;
    lang = lang || this.lastResData.langSource || this.lastReqData.langFrom;
    if (!this.urlTextToSpeech || !text) return;
    var url = this.getAudioUrl(text, lang);
    if (url) this.audio = new Audio(url).play();
};

/**
 * Get url of text-to-speech audio file or stream
 * @param {string} text
 * @param {string} lang
 * @return {string}
 */
Vendor.prototype.getAudioUrl = function (text, lang) {
    text = encodeURIComponent(text);
    lang = lang !== this.autoDetect ? lang : '';
    return UTILS.sprintf(this.urlTextToSpeech, text, lang);
};

/**
 * Get current selected languages
 * @return {{langFrom: String, langTo: String}}
 */
Vendor.prototype.getLangPair = function () {
    var vendorBlock = APP.get('settingsContainer.vendorBlock');
    return {
        langFrom: vendorBlock.langFrom,
        langTo  : vendorBlock.langTo
    };
};

exports.Vendor = Vendor;