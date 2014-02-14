'use strict';

var UTILS = require('../utils'),
    inherit = require('../utils').inherit,
    Vendor = require('./vendor').Vendor;

/**
 * @constructor
 */
var Google = function (options) {
    Google.superclass.constructor.call(this, options);

    this.name = 'google';
    this.title = 'Google';
    this.url = 'http://translate.google.com';
    this.urlTextToSpeech = this.url + '/translate_tts?ie=UTF-8&q={0}&tl={1}';
    this.langList = $.extend({}, this.langList, LANGUAGES);
};

inherit(Google, Vendor);

/** @private */
Google.prototype.makeRequest = function (data) {
    return $.ajax({
        url : this.url + '/translate_a/t?client=t&ie=UTF-8&sc=1',
        dataType: 'json',
        dataFilter: this.dataFilter,
        data: {
            q : data.text,
            hl: data.langTo,   // header language for the part of speech in dictionary
            sl: data.langFrom, // source language
            tl: data.langTo   // translate to language
        }
    });
};

/** @private */
Google.prototype.dataFilter = function (data, type) {
    // Make valid strict JSON-response
    return JSON.stringify(Function('return ' + data)());
};

/** @private */
Google.prototype.parseData = function (data) {
    return Google.superclass.parseData.call(this, {
        translation: data[0].map(function (text) { return text[0] }).join(' ')
            .replace(/([<\(\{\[])\s+/g, '$1')
            .replace(/\s+([\)\}\]>])/g, '$1')
            .replace(/\s+([:;,.!?])/gi, '$1'),
        langSource  : data[2],
        langDetected: data[8] && data[8][0] && data[8][0][0],
        spellCheck  : data[7] && data[7][0] ? data[7][1] : '',
        dictionary  : (data[1] || []).map(function (dictData) {
            return {
                partOfSpeech: dictData[0],
                translation : dictData[1],
                similarWords: dictData[2].map(function (simData) {
                    return {
                        word    : simData[0],
                        meanings: simData[1]
                    }
                })
            };
        })
    });
};

/** @const */
var LANGUAGES = {
    "auto" : "Auto detect",
    "af"   : "Afrikaans",
    "sq"   : "Albanian",
    "ar"   : "Arabic",
    "hy"   : "Armenian",
    "az"   : "Azerbaijani",
    "eu"   : "Basque",
    "be"   : "Belarusian",
    "bn"   : "Bengali",
    "bs"   : "Bosnian",
    "bg"   : "Bulgarian",
    "ca"   : "Catalan",
    "ceb"  : "Cebuano",
    "zh-CN": "Chinese",
    "hr"   : "Croatian",
    "cs"   : "Czech",
    "da"   : "Danish",
    "nl"   : "Dutch",
    "en"   : "English",
    "eo"   : "Esperanto",
    "et"   : "Estonian",
    "tl"   : "Filipino",
    "fi"   : "Finnish",
    "fr"   : "French",
    "gl"   : "Galician",
    "ka"   : "Georgian",
    "de"   : "German",
    "el"   : "Greek",
    "gu"   : "Gujarati",
    "ht"   : "Haitian Creole",
    "iw"   : "Hebrew",
    "hi"   : "Hindi",
    "hmn"  : "Hmong",
    "hu"   : "Hungarian",
    "is"   : "Icelandic",
    "id"   : "Indonesian",
    "ga"   : "Irish",
    "it"   : "Italian",
    "ja"   : "Japanese",
    "jw"   : "Javanese",
    "kn"   : "Kannada",
    "km"   : "Khmer",
    "ko"   : "Korean",
    "lo"   : "Lao",
    "la"   : "Latin",
    "lv"   : "Latvian",
    "lt"   : "Lithuanian",
    "mk"   : "Macedonian",
    "ms"   : "Malay",
    "mt"   : "Maltese",
    "mr"   : "Marathi",
    "no"   : "Norwegian",
    "fa"   : "Persian",
    "pl"   : "Polish",
    "pt"   : "Portuguese",
    "ro"   : "Romanian",
    "ru"   : "Russian",
    "sr"   : "Serbian",
    "sk"   : "Slovak",
    "sl"   : "Slovenian",
    "es"   : "Spanish",
    "sw"   : "Swahili",
    "sv"   : "Swedish",
    "ta"   : "Tamil",
    "te"   : "Telugu",
    "th"   : "Thai",
    "tr"   : "Turkish",
    "uk"   : "Ukrainian",
    "ur"   : "Urdu",
    "vi"   : "Vietnamese",
    "cy"   : "Welsh",
    "yi"   : "Yiddish"
};

exports.Google = Google;