'use strict';

var inherit = require('../utils').inherit,
    Vendor = require('./vendor').Vendor;

/**
 * @constructor
 */
var Google = function (options) {
    Google.superclass.constructor.call(this, options);

    this.name = 'google';
    this.title = 'Google';
    this.url = 'http://translate.google.com';
    this.langList = $.extend({}, this.langList, LANGUAGES);
    this.textToSpeech = true;
};

inherit(Google, Vendor);

Google.prototype.translateText = function (text) {
    this.sourceText = text;
    this.swapped = false;
    return this.loadData(text);
};

/** @private */
Google.prototype.loadData = function (text, lang) {
    lang = $.extend(this.getLangPair(), lang);
    var loadingReq = $.ajax({
        url : this.url + '/translate_a/t?client=t&sc=1&ie=UTF-8',
        data: {
            q : text,
            sl: lang.from,
            hl: lang.to,
            tl: lang.to
        }
    });
    return loadingReq
        .then(this.parseData.bind(this))
        .then(this.autoSwapLang.bind(this));
};

/** @private */
Google.prototype.autoSwapLang = function (data) {
    var lang = this.getLangPair(),
        langDetected = data.langDetected;

    if (langDetected && lang.from !== this.autoDetect && !this.swapped) {
        this.swapped = true;
        return this.loadData(this.sourceText, {
            from: langDetected,
            to  : langDetected !== lang.from ? lang.from : lang.to
        });
    }
    return data;
};

/** @private */
Google.prototype.parseData = function (response) {
    var data = Function('return ' + response)();
    var parentData = Google.superclass.parseData.call(this, data);
    return $.extend(parentData, {
        translation : data[0][0][0].replace(/\s+([:;,.!?])/gi, '$1'),
        langSource  : data[2],
        langDetected: data[8] && data[8][0] && data[8][0][0],
        spellCheck  : data[7] && data[7][0] ? data[7][1] : '',
        dictionary  : (data[1] || []).map(function (dictData) {
            return {
                partOfSpeech: dictData[0],
                translation : dictData[1],
                similarWords: dictData[2].map(function (syn) {
                    return {
                        word    : syn[0],
                        meanings: syn[1]
                    }
                })
            };
        })
    });
};

Google.prototype.getAudioUrl = function (text) {
    var lang = this.getLangPair();
    return this.url + [
        '/translate_tts?ie=UTF-8',
        'q=' + text,
        'tl=' + (lang.from !== this.autoDetect ? lang.from : '')
    ].join('&');
};

/** @const */
var LANGUAGES = {
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