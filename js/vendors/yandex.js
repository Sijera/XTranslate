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
    this.ttsFormat = 'audio/wav';
    this.urlTextToSpeech = 'http://tts.voicetech.yandex.net/tts?format=' + this.ttsFormat.split('/')[1] + '&quality=hi&platform=web&text={0}&lang={1}';
    this.langList = $.extend({}, LANGUAGES);
};

inherit(Yandex, Vendor);

/** @private */
Yandex.prototype.makeRequest = function (data) {
    var langFrom = data.langFrom,
        langTo = data.langTo,
        text = data.text,
        langPair = [langFrom, langTo].join('-');

    var translateReq = $.ajax({
        url : 'http://translate.yandex.net/api/v1/tr.json/translate',
        data: {
            srv    : 'tr-text',
            options: 1, // add detected language to response
            lang   : langPair,
            text   : text
        }
    });

    var dictReq = $.ajax({
        url : 'http://translate.yandex.net/dicservice.json/lookup',
        data: {
            ui  : langTo,
            lang: langPair,
            text: text
        }
    });

    $.when(translateReq, dictReq).then(
        function ok(transRes, dicRes) {
            this.request.resolve(transRes[0], dicRes[0]);
        }.bind(this),

        function failed(jqXHR, status, errorText) {
            if (status === 'abort') return;
            var data = translateReq.responseJSON;
            if (data) this.request.resolve(data);
        }.bind(this)
    );

    this.request = $.Deferred().fail(function () {
        translateReq.abort();
        dictReq.abort();
    });
    return this.request;
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

    // base translation
    if (translation.code === 200) {
        $.extend(response, {
            translation : translation.text.join(' '),
            langSource  : translation.lang.split('-')[0],
            langDetected: translation.detected.lang
        });
    }
    else {
        // handle error
        response.translation = translation.message;
    }

    // parse dictionary
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
    en: 'en_GB',
    ru: 'ru_RU',
    tr: 'tr_TR',
    it: 'it_IT',
    fr: 'fr_FR',
    es: 'es_ES',
    de: 'de_DE',
    cs: 'cs_CZ',
    pl: 'pl_PL'
};

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