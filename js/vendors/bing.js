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
    this.langList = LANGUAGES;
};

inherit(Bing, Vendor);

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