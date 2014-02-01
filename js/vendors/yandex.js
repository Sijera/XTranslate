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
    this.urlTextToSpeech = 'http://tts.voicetech.yandex.net/tts?format=mp3&quality=hi&platform=web&text={0}&lang={1}';
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

    return $.when(translateReq, dictReq).then(null, function failed() {
        return $.when(translateReq, ['']);
    });
};

/** @const */
var getText = function (obj) { return obj.text };

/**
 * @private
 * @param {Object} translation ({"code":200,"detected":{"lang":"en"},"lang":"en-ru","text":["образец"]})
 * @param {Object} dictionary ({"head":{},"def":[{"text":"cat","pos":"существительное","ts":"kæt","tr":[{"text":"кошка","pos":"существительное","syn":[{"text":"кот"},{"text":"котенок"},{"text":"котик"}],"mean":[{"text":"feline"},{"text":"puss"},{"text":"kitten"}],"ex":[{"text":"pedigreed cats","tr":[{"text":"породистые кошки"}]},{"text":"Cheshire cat","tr":[{"text":"Чеширский кот"}]}]},{"text":"кошечка","pos":"существительное","mean":[{"text":"kitty"}],"ex":[{"text":"white cat","tr":[{"text":"белая кошечка"}]}]}]},{"text":"cat","pos":"прилагательное","ts":"kæt","tr":[{"text":"кошачий","pos":"прилагательное","mean":[{"text":"feline"}],"ex":[{"text":"cat's claw","tr":[{"text":"кошачий коготь"}]}]}]}]})
 * @return {Object}
 */
Yandex.prototype.parseData = function (translation, dictionary) {
    var response = {};
    translation = translation[0];
    dictionary = dictionary[0];

    // basic translation
    if (translation.code === 200) {
        $.extend(response, {
            translation : translation.text.join(' '),
            langSource  : translation.lang.split('-')[0],
            langDetected: translation.detected.lang
        });
    }
    // dictionary data
    if (Array.isArray(dictionary.def)) {
        response.dictionary = dictionary.def.map(function (dictData) {
            if (!response.transcription && dictData.ts) response.transcription = dictData.ts;
            return {
                partOfSpeech: dictData.pos,
                translation : dictData.tr.map(getText),
                similarWords: dictData.tr.map(function (translation) {
                    return {
                        word: translation.text,
                        meanings: (translation.mean || []).map(getText),
                        examples: (translation.ex || []).map(function (ex) {
                            return [ex.text, ex.tr.map(getText).join(', ')].join(' - ');
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