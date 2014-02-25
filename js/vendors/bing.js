'use strict';

var inherit = require('../utils').inherit,
    Vendor = require('./vendor').Vendor;

/**
 * @constructor
 */
var Bing = function (options) {
    Bing.superclass.constructor.call(this, options);

    this.name = 'bing';
    this.title = 'Bing';
    this.url = 'http://bing.com/translator/';
    this.apiUrl = 'http://api.microsofttranslator.com/v2';
    this.appId = 'C99C654F52B9010F7B789D98343831212B58CB34';
    this.urlTextToSpeech = this.apiUrl + '/http.svc/Speak?format=audio/mp3&options=MaxQuality&text={0}&language={1}&appId='+ this.appId;
    this.langList = $.extend({}, this.langList, LANGUAGES);
};

inherit(Bing, Vendor);

/** @private */
Bing.prototype.makeRequest = function (data) {
    return (this.request = $.ajax({
        url: this.apiUrl + '/ajax.svc/TranslateArray',
        dataType: 'json',
        data: {
            appId: this.appId,
            texts: JSON.stringify([data.text]),
            from : data.langFrom !== this.autoDetect ? data.langFrom : '',
            to   : data.langTo
        }
    }));
};

/** @private */
Bing.prototype.parseData = function (data) {
    var langSource = data[0]['From'];
    var translation = data[0]['TranslatedText'];
    var langDetected = translation.toLowerCase() == this.lastReqData.text.toLowerCase() ? this.lastReqData.langTo : '';
    return Bing.superclass.parseData.call(this, {
        langSource  : langSource,
        langDetected: langDetected,
        translation : translation
    });
};

/** @const */
var LANGUAGES = {
    "auto"  : "Auto detect",
    "ar"    : "Arabic",
    "bg"    : "Bulgarian",
    "ca"    : "Catalan",
    "zh-CHS": "Chinese (简体字)",
    "zh-CHT": "Chinese (簡體字)",
    "cs"    : "Czech",
    "da"    : "Danish",
    "nl"    : "Dutch",
    "en"    : "English",
    "et"    : "Estonian",
    "fi"    : "Finnish",
    "fr"    : "French",
    "de"    : "German",
    "el"    : "Greek",
    "ht"    : "Haitian Creole",
    "he"    : "Hebrew",
    "hi"    : "Hindi",
    "mww"   : "Hmong Daw",
    "hu"    : "Hungarian",
    "id"    : "Indonesian",
    "it"    : "Italian",
    "ja"    : "Japanese",
    "ko"    : "Korean",
    "lv"    : "Latvian",
    "lt"    : "Lithuanian",
    "ms"    : "Malay",
    "mt"    : "Maltese",
    "no"    : "Norwegian",
    "fa"    : "Persian",
    "pl"    : "Polish",
    "pt"    : "Portuguese",
    "ro"    : "Romanian",
    "ru"    : "Russian",
    "sk"    : "Slovak",
    "sl"    : "Slovenian",
    "es"    : "Spanish",
    "sv"    : "Swedish",
    "th"    : "Thai",
    "tr"    : "Turkish",
    "uk"    : "Ukrainian",
    "ur"    : "Urdu",
    "vi"    : "Vietnamese"
};

exports.Bing = Bing;