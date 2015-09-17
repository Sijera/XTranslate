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
    this.url = 'https://translate.yandex.net';
    this.publicUrl = 'http://translate.yandex.com';
    this.ttsFormat = 'audio/wav';
    this.urlTextToSpeech = 'http://tts.voicetech.yandex.net/tts?format=' + this.ttsFormat.split('/')[1] + '&quality=hi&platform=web&text={0}&lang={1}';
    this.langList = $.extend({}, LANGUAGES);
    this.possibleDirections = DIRECTIONS;
};

inherit(Yandex, Vendor);

/** @private */
Yandex.prototype.makeRequest = function (data) {
    var that = this,
        langFrom = data.langFrom,
        langTo = data.langTo,
        text = data.text;

    var getLangPair = function () {
      return [langFrom, langTo].join('-');
    };

    var translateReq = function () {
        return $.ajax({
          url : that.url + '/api/v1.5/tr.json/translate',
          data: {
            key: 'trnsl.1.1.20150914T180031Z.d57dac9b80d5924d.b3cbe0d972e98684b6b5ec1d1ccdf5d4e0bc401f',
            format: 'plain', // or "html"
            options: 1, // add detected language to response
            lang   : langFrom === that.autoDetect ? langTo : getLangPair(),
            text   : text
          }
        });
    };

    var dictReq = function () {
        return $.ajax({
          url : 'http://translate.yandex.net/dicservice.json/lookup',
          data: {
            ui: langTo,
            lang: getLangPair(),
            text: text
          }
        });
    };

    translateReq().done(function (translation) {
      if (langFrom === that.autoDetect) {
        langFrom = translation.detected.lang;
      }
      dictReq().done(function (dictionary) {
        that.request.resolve(translation, dictionary);
      }).fail(function () {
        that.request.resolve(translation);
      });
    });

    return this.request = $.Deferred();
};

Yandex.prototype.abort = function () {
    this.request.reject();
};

/** @private */
var parserHelpers = {
    getText: function (obj) { return obj.text }
};

/** @private */
Yandex.prototype.parseData = function (translation, dictionary) {
    var response = {};

    if (translation.code === 200) {
        $.extend(response, {
            translation : translation.text.join(' '),
            langSource  : translation.lang.split('-')[0],
            langDetected: translation.detected.lang
        });
    }
    if (dictionary) {
        response.dictionary = dictionary.def.map(function (dictData) {
            if (!response.transcription && dictData.ts) response.transcription = dictData.ts;
            return {
                partOfSpeech: dictData.pos,
                translation : dictData.tr.map(parserHelpers.getText),
                similarWords: dictData.tr.map(function (translation) {
                    return {
                        word: translation.text,
                        meanings: (translation.mean || []).map(parserHelpers.getText),
                        examples: (translation.ex || []).map(function (ex) {
                            return [ex.text, ex.tr.map(parserHelpers.getText).join(', ')].join(' - ');
                        })
                    };
                })
            };
        });
    }
    return Yandex.superclass.parseData.call(this, response);
};

Yandex.prototype.getAudioUrl = function (text, lang) {
    lang = LANGUAGES_TTS[lang];
    if (!lang || text.length > 100) return '';
    return Yandex.superclass.getAudioUrl.call(this, text, lang);
};

/** @const */
var LANGUAGES_TTS = {
  en: "en_GB",
  ru: "ru_RU",
  tr: "tr_TR",
  it: "it_IT",
  fr: "fr_FR",
  es: "es_ES",
  de: "de_DE",
  pl: "pl_PL",
  cs: "cs_CZ",
  sv: "sv_SE",
  pt: "pt_PT",
  fi: "fi_FI",
  ar: "ar_AE",
  ca: "ca_ES",
  da: "da_DK",
  nl: "nl_NL",
  el: "el_GR",
  no: "no_NO"
};

// https://translate.yandex.net/api/v1.5/tr.json/getLangs?ui=en&key=...
var DIRECTIONS = ["az-ru", "be-bg", "be-cs", "be-de", "be-en", "be-es", "be-fr", "be-it", "be-pl", "be-ro", "be-ru", "be-sr", "be-tr", "bg-be", "bg-ru", "bg-uk", "ca-en", "ca-ru", "cs-be", "cs-en", "cs-ru", "cs-uk", "da-en", "da-ru", "de-be", "de-en", "de-es", "de-fr", "de-it", "de-ru", "de-tr", "de-uk", "el-en", "el-ru", "en-be", "en-ca", "en-cs", "en-da", "en-de", "en-el", "en-es", "en-et", "en-fi", "en-fr", "en-hu", "en-it", "en-lt", "en-lv", "en-mk", "en-nl", "en-no", "en-pt", "en-ru", "en-sk", "en-sl", "en-sq", "en-sv", "en-tr", "en-uk", "es-be", "es-de", "es-en", "es-ru", "es-uk", "et-en", "et-ru", "fi-en", "fi-ru", "fr-be", "fr-de", "fr-en", "fr-ru", "fr-uk", "hr-ru", "hu-en", "hu-ru", "hy-ru", "it-be", "it-de", "it-en", "it-ru", "it-uk", "lt-en", "lt-ru", "lv-en", "lv-ru", "mk-en", "mk-ru", "nl-en", "nl-ru", "no-en", "no-ru", "pl-be", "pl-ru", "pl-uk", "pt-en", "pt-ru", "ro-be", "ro-ru", "ro-uk", "ru-az", "ru-be", "ru-bg", "ru-ca", "ru-cs", "ru-da", "ru-de", "ru-el", "ru-en", "ru-es", "ru-et", "ru-fi", "ru-fr", "ru-hr", "ru-hu", "ru-hy", "ru-it", "ru-lt", "ru-lv", "ru-mk", "ru-nl", "ru-no", "ru-pl", "ru-pt", "ru-ro", "ru-sk", "ru-sl", "ru-sq", "ru-sr", "ru-sv", "ru-tr", "ru-uk", "sk-en", "sk-ru", "sl-en", "sl-ru", "sq-en", "sq-ru", "sr-be", "sr-ru", "sr-uk", "sv-en", "sv-ru", "tr-be", "tr-de", "tr-en", "tr-ru", "tr-uk", "uk-bg", "uk-cs", "uk-de", "uk-en", "uk-es", "uk-fr", "uk-it", "uk-pl", "uk-ro", "uk-ru", "uk-sr", "uk-tr"];

/** @const */
var LANGUAGES = {
  "auto": "Auto-detect",
  "af": "Afrikaans",
  "sq": "Albanian",
  "ar": "Arabic",
  "hy": "Armenian",
  "az": "Azerbaijani",
  "eu": "Basque",
  "be": "Belarusian",
  "bs": "Bosnian",
  "bg": "Bulgarian",
  "ca": "Catalan",
  "zh": "Chinese",
  "hr": "Croatian",
  "cs": "Czech",
  "da": "Danish",
  "nl": "Dutch",
  "en": "English",
  "et": "Estonian",
  "fi": "Finnish",
  "fr": "French",
  "gl": "Galician",
  "ka": "Georgian",
  "de": "German",
  "el": "Greek",
  "ht": "Haitian",
  "he": "Hebrew",
  "hu": "Hungarian",
  "is": "Icelandic",
  "id": "Indonesian",
  "ga": "Irish",
  "it": "Italian",
  "ja": "Japanese",
  "kk": "Kazakh",
  "ky": "Kirghiz",
  "ko": "Korean",
  "la": "Latin",
  "lv": "Latvian",
  "lt": "Lithuanian",
  "mk": "Macedonian",
  "mg": "Malagasy",
  "ms": "Malay",
  "mt": "Maltese",
  "mn": "Mongolian",
  "no": "Norwegian",
  "fa": "Persian",
  "pl": "Polish",
  "pt": "Portuguese",
  "ro": "Romanian",
  "ru": "Russian",
  "sr": "Serbian",
  "sk": "Slovak",
  "sl": "Slovenian",
  "es": "Spanish",
  "sw": "Swahili",
  "sv": "Swedish",
  "tl": "Tagalog",
  "tg": "Tajik",
  "tt": "Tatar",
  "th": "Thai",
  "tr": "Turkish",
  "uk": "Ukrainian",
  "uz": "Uzbek",
  "vi": "Vietnamese",
  "cy": "Welsh"
};

exports.Yandex = Yandex;