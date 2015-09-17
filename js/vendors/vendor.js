'use strict';

var UTILS = require('../utils'),
    inherit = require('../utils').inherit,
    EventDriven = require('../events').EventDriven;

/**
 * Base class for all translation services
 * @constructor
 */
var Vendor = function () {
    Vendor.superclass.constructor.call(this);

    this.autoDetect = 'auto';
    this.defaultLang = 'en';
    this.urlTextToSpeech = '';
    this.langList = {};
    this.lastResData = {};
    this.lastReqData = {text: '', langFrom: '', langTo: ''};
};

inherit(Vendor, EventDriven);

Vendor.prototype.translateText = function (text) {
    if (!text) return $.Deferred().reject();
    this.autoDetected = false;
    if (this.request && this.request.state() === 'pending') this.abort();
    return this.loadData({text: text});
};

/**
 * Create ajax request with provided arguments for getting translation data
 * @param {{langFrom: String=, langTo: String=, text: String}} data
 * @return {jQuery.Deferred}
 */
Vendor.prototype.makeRequest = function (data) {
    // must be overridden!
    return (this.request = $.ajax(data));
};

/** @protected */
Vendor.prototype.abort = function () {
    this.request.abort();
};

/** @protected */
Vendor.prototype.loadData = function (data) {
    var lastReq = this.lastReqData;
    data = $.extend(this.getCurrentLang(), data);

    if (this.lastResData.resolved &&
        data.text === lastReq.text &&
        data.langFrom == lastReq.langFrom &&
        data.langTo == lastReq.langTo) {
        return $.Deferred().resolve(this.lastResData);
    }

    this.lastResData.resolved = false;
    return this.makeRequest($.extend(this.lastReqData, data))
        .then(this.parseData.bind(this))
        .then(this.autoDetection.bind(this));
};

/**
 * Parse response from server and convert the data to internal format for the app views
 * @see VendorDataView.parseData for the details about possible data returning from vendor
 * @param {Object} response
 */
Vendor.prototype.parseData = function (response) {
    var ttsEnabled = !!this.getAudioUrl(this.lastReqData.text, response.langSource);
    return (this.lastResData = $.extend({
        resolved  : true,
        ttsEnabled: ttsEnabled,
        vendor    : this.name,
        sourceText: this.lastReqData.text
    }, response));
};

/** @protected */
Vendor.prototype.autoDetection = function (parsedData) {
    var lang = this.getCurrentLang();
    var sameText = parsedData.sourceText.toLowerCase().replace(/\s/g, "") === parsedData.translation.toLowerCase().replace(/\s/g, "");
    var langDetected = parsedData.langDetected || lang.langTo;
    var langFrom = this.hasAutoDetect() ? this.autoDetect : langDetected;
    if (!this.autoDetected && sameText) {
        this.autoDetected = true;
        return this.loadData({
            langFrom: langFrom,
            langTo  : langDetected !== lang.langTo ? lang.langTo : lang.langFrom
        });
    }
    return parsedData;
};

Vendor.prototype.playText = function (text) {
    text = text || this.lastReqData.text;
    var lang = this.lastResData.langSource || this.lastReqData.langFrom || this.getCurrentLang().langFrom;
    if (!this.urlTextToSpeech || !text) return;

    this.stopPlaying();
    this.audio = document.createElement('audio');
    this.audio.autoplay = true;

    var vendors = [this].concat(APP.vendors); // move yourself to the top of priority
    vendors.splice(vendors.lastIndexOf(this), 1); // remove duplicate
    vendors.forEach(function (vendor) {
        var audioUrl = vendor.getAudioUrl(text, lang);
        if (audioUrl) {
            var source = document.createElement('source');
            source.src = audioUrl;
            source.type = vendor.ttsFormat;
            this.audio.appendChild(source);
        }
    }, this);
};

Vendor.prototype.stopPlaying = function () {
    if (!this.audio) return;
    this.audio.pause();
    delete this.audio;
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
Vendor.prototype.getCurrentLang = function () {
    var vendorBlock = APP.get('settingsContainer.vendorBlock');
    var hasLangFrom = this.getLangSet('from')[vendorBlock.langFrom] !== undefined;
    return {
        langFrom: hasLangFrom ? vendorBlock.langFrom : this.defaultLang,
        langTo  : vendorBlock.langTo
    };
};

Vendor.prototype.getLangSet = function (direction) {
  direction = direction || 'from';
  var langSet = this.langList[direction];
  return typeof langSet === 'object' ? langSet : this.langList;
};

/**
 * @param {Google|Yandex|Vendor} otherVendor
 */
Vendor.prototype.canUseCurrentLangWith = function (otherVendor) {
    var lang = this.getCurrentLang();
    return otherVendor.getLangSet('from')[lang.langFrom] !== undefined
      && otherVendor.getLangSet('to')[lang.langTo] !== undefined;
};

Vendor.prototype.hasAutoDetect = function () {
    return this.getLangSet('from')[this.autoDetect] !== undefined;
};

exports.Vendor = Vendor;