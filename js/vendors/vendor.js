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
    this.urlTextToSpeech = '';
    this.langList = {};
    this.lastResData = {};
    this.lastReqData = {text: '', langFrom: '', langTo: ''};
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
    var lastReq = this.lastReqData;
    data = $.extend(this.getLang(), data);

    if (data.text === lastReq.text &&
        data.langFrom == lastReq.langFrom &&
        data.langTo == lastReq.langTo) {
        return $.Deferred().resolve(this.lastResData);
    }

    return this.makeRequest($.extend(this.lastReqData, data))
        .then(this.parseData.bind(this))
        .then(this.swapLang.bind(this));
};

/**
 * Parse response from server and convert the data to internal format for the app views
 * @see VendorDataView.parseData for the details about possible data returning from vendor
 * @param {Object} response
 */
Vendor.prototype.parseData = function (response) {
    var ttsEnabled = !!this.getAudioUrl(this.lastReqData.text, response.langSource);
    this.lastResData = $.extend({ttsEnabled: ttsEnabled, sourceText: this.lastReqData.text}, response);
    return this.lastResData;
};

/** @protected */
Vendor.prototype.swapLang = function (parsedData) {
    if (this.swapped) return parsedData;

    var langPair = this.getLang(),
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

Vendor.prototype.playText = function (text) {
    text = text || this.lastReqData.text;
    var lang = this.lastResData.langSource || this.lastReqData.langFrom || this.getLang().langFrom;
    if (!this.urlTextToSpeech || !text) return;

    var url = this.getAudioUrl(text, lang);
    if (url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.send();
        xhr.onload = function () {
            var reader = new FileReader();
            reader.readAsDataURL(xhr.response);
            reader.addEventListener('loadend', function () {
                var base64DataUrl = reader.result;
                this.audio = new Audio(base64DataUrl);
                this.audio.play();
                console.info(base64DataUrl);
            }.bind(this), false);
        }.bind(this);
    }
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
Vendor.prototype.getLang = function () {
    var vendorBlock = APP.get('settingsContainer.vendorBlock');
    return {
        langFrom: vendorBlock.langFrom,
        langTo  : vendorBlock.langTo
    };
};

exports.Vendor = Vendor;