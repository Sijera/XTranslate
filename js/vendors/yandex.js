'use strict';

var inherit = require('../utils').inherit,
    Vendor = require('./vendor').Vendor;

/**
 * @constructor
 */
var Yandex = function (options) {
    Yandex.superclass.constructor.call(this, options);

    this.name = 'yandex';
    this.title = 'Yandex';
    this.url = 'http://translate.yandex.com';
    this.langList = LANGUAGES;
    this.tts = false;
};

inherit(Yandex, Vendor);

/** @const */
var LANGUAGES = {
    "sq": "Albanian",
    "hy": "Armenian",
    "az": "Azerbaijani",
    "be": "Belarusian",
    "bg": "Bulgarian",
    "ca": "Catalan",
    "hr": "Croatian",
    "cs": "Czech",
    "da": "Danish",
    "nl": "Dutch",
    "en": "English",
    "et": "Estonian",
    "fi": "Finnish",
    "fr": "French",
    "de": "German",
    "el": "Greek",
    "hu": "Hungarian",
    "it": "Italian",
    "lv": "Latvian",
    "lt": "Lithuanian",
    "mk": "Macedonian",
    "no": "Norwegian",
    "pl": "Polish",
    "pt": "Portuguese",
    "ro": "Romanian",
    "ru": "Russian",
    "sr": "Serbian",
    "sk": "Slovak",
    "sl": "Slovenian",
    "es": "Spanish",
    "sv": "Swedish",
    "tr": "Turkish",
    "uk": "Ukrainian"
};

exports.Yandex = Yandex;