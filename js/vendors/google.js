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
    this.ttsFormat = 'audio/mp3';
    this.urlTextToSpeech = this.url + '/translate_tts?ie=UTF-8&q={0}&tl={1}';
    this.langList = $.extend({}, this.langList, LANGUAGES);
};

inherit(Google, Vendor);

/** @private */
Google.prototype.makeRequest = function (data) {
    var dtParams = 'dt=bd&dt=ex&dt=ld&dt=md&dt=qc&dt=rw&dt=rm&dt=ss&dt=t&dt=at';
    return (this.request = $.ajax({
        url : this.url + '/translate_a/single?client=t&ie=UTF-8&oe=UTF-8&otf=1&ssel=0&tsel=0&kc=3&'+ dtParams,
        dataType: 'json',
        dataFilter: this.dataFilter,
        data: {
            q : data.text,
            hl: data.langTo,   // header language for the part of speech in dictionary
            sl: data.langFrom, // source language
            tl: data.langTo   // translate to language
        }
    }));
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
        spellCheck  : data[7] && data[7][0] || '',
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

// Actual list of supported languages:
// http://translate.googleapis.com/translate_a/l?client=te&hl=en&cb=console.log

/** @const */
var LANGUAGES = {
  "from": {
    "auto": "Auto-detect",
    "af": "Afrikaans",
    "sq": "Albanian",
    "ar": "Arabic",
    "hy": "Armenian",
    "az": "Azerbaijani",
    "eu": "Basque",
    "be": "Belarusian",
    "bn": "Bengali",
    "bs": "Bosnian",
    "bg": "Bulgarian",
    "ca": "Catalan",
    "ceb": "Cebuano",
    "ny": "Chichewa",
    "zh-CN": "Chinese",
    "hr": "Croatian",
    "cs": "Czech",
    "da": "Danish",
    "nl": "Dutch",
    "en": "English",
    "eo": "Esperanto",
    "et": "Estonian",
    "tl": "Filipino",
    "fi": "Finnish",
    "fr": "French",
    "gl": "Galician",
    "ka": "Georgian",
    "de": "German",
    "el": "Greek",
    "gu": "Gujarati",
    "ht": "Haitian Creole",
    "ha": "Hausa",
    "iw": "Hebrew",
    "hi": "Hindi",
    "hmn": "Hmong",
    "hu": "Hungarian",
    "is": "Icelandic",
    "ig": "Igbo",
    "id": "Indonesian",
    "ga": "Irish",
    "it": "Italian",
    "ja": "Japanese",
    "jw": "Javanese",
    "kn": "Kannada",
    "kk": "Kazakh",
    "km": "Khmer",
    "ko": "Korean",
    "lo": "Lao",
    "la": "Latin",
    "lv": "Latvian",
    "lt": "Lithuanian",
    "mk": "Macedonian",
    "mg": "Malagasy",
    "ms": "Malay",
    "ml": "Malayalam",
    "mt": "Maltese",
    "mi": "Maori",
    "mr": "Marathi",
    "mn": "Mongolian",
    "my": "Myanmar (Burmese)",
    "ne": "Nepali",
    "no": "Norwegian",
    "fa": "Persian",
    "pl": "Polish",
    "pt": "Portuguese",
    "pa": "Punjabi",
    "ro": "Romanian",
    "ru": "Russian",
    "sr": "Serbian",
    "st": "Sesotho",
    "si": "Sinhala",
    "sk": "Slovak",
    "sl": "Slovenian",
    "so": "Somali",
    "es": "Spanish",
    "su": "Sundanese",
    "sw": "Swahili",
    "sv": "Swedish",
    "tg": "Tajik",
    "ta": "Tamil",
    "te": "Telugu",
    "th": "Thai",
    "tr": "Turkish",
    "uk": "Ukrainian",
    "ur": "Urdu",
    "uz": "Uzbek",
    "vi": "Vietnamese",
    "cy": "Welsh",
    "yi": "Yiddish",
    "yo": "Yoruba",
    "zu": "Zulu"
  },
  "to": {
    "af": "Afrikaans",
    "sq": "Albanian",
    "ar": "Arabic",
    "hy": "Armenian",
    "az": "Azerbaijani",
    "eu": "Basque",
    "be": "Belarusian",
    "bn": "Bengali",
    "bs": "Bosnian",
    "bg": "Bulgarian",
    "ca": "Catalan",
    "ceb": "Cebuano",
    "ny": "Chichewa",
    "zh-CN": "Chinese (Simplified)",
    "zh-TW": "Chinese (Traditional)",
    "hr": "Croatian",
    "cs": "Czech",
    "da": "Danish",
    "nl": "Dutch",
    "en": "English",
    "eo": "Esperanto",
    "et": "Estonian",
    "tl": "Filipino",
    "fi": "Finnish",
    "fr": "French",
    "gl": "Galician",
    "ka": "Georgian",
    "de": "German",
    "el": "Greek",
    "gu": "Gujarati",
    "ht": "Haitian Creole",
    "ha": "Hausa",
    "iw": "Hebrew",
    "hi": "Hindi",
    "hmn": "Hmong",
    "hu": "Hungarian",
    "is": "Icelandic",
    "ig": "Igbo",
    "id": "Indonesian",
    "ga": "Irish",
    "it": "Italian",
    "ja": "Japanese",
    "jw": "Javanese",
    "kn": "Kannada",
    "kk": "Kazakh",
    "km": "Khmer",
    "ko": "Korean",
    "lo": "Lao",
    "la": "Latin",
    "lv": "Latvian",
    "lt": "Lithuanian",
    "mk": "Macedonian",
    "mg": "Malagasy",
    "ms": "Malay",
    "ml": "Malayalam",
    "mt": "Maltese",
    "mi": "Maori",
    "mr": "Marathi",
    "mn": "Mongolian",
    "my": "Myanmar (Burmese)",
    "ne": "Nepali",
    "no": "Norwegian",
    "fa": "Persian",
    "pl": "Polish",
    "pt": "Portuguese",
    "pa": "Punjabi",
    "ro": "Romanian",
    "ru": "Russian",
    "sr": "Serbian",
    "st": "Sesotho",
    "si": "Sinhala",
    "sk": "Slovak",
    "sl": "Slovenian",
    "so": "Somali",
    "es": "Spanish",
    "su": "Sundanese",
    "sw": "Swahili",
    "sv": "Swedish",
    "tg": "Tajik",
    "ta": "Tamil",
    "te": "Telugu",
    "th": "Thai",
    "tr": "Turkish",
    "uk": "Ukrainian",
    "ur": "Urdu",
    "uz": "Uzbek",
    "vi": "Vietnamese",
    "cy": "Welsh",
    "yi": "Yiddish",
    "yo": "Yoruba",
    "zu": "Zulu"
  }
};

exports.Google = Google;