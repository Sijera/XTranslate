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
    this.ttsFormat = 'audio/wav';
    this.urlTextToSpeech = this.apiUrl + '/http.svc/Speak?format=' + this.ttsFormat + '&options=MaxQuality&text={0}&language={1}&appId={2}';
    this.langList = $.extend({}, this.langList, LANGUAGES);
};

inherit(Bing, Vendor);

/** @private */
Bing.prototype.makeRequest = function (data) {
    this.appId = APP.get('vendors.bing.appId');

    var translateReq = function () {
      return $.ajax({
          url: this.apiUrl + '/ajax.svc/TranslateArray',
          dataType: 'json',
          data: {
              appId: this.appId,
              texts: JSON.stringify([data.text]),
              from : data.langFrom !== this.autoDetect ? data.langFrom : '',
              to   : data.langTo
          }
      });
    }.bind(this);

    var translateReqWithRefreshToken = function () {
        return this.refreshToken().then(function () {
            return translateReq();
        });
    }.bind(this);

    // first time using bing
    if (!this.appId) {
        this.request = translateReqWithRefreshToken();
    }
    // other cases
    else {
        this.request = translateReq().then(function (data) {
            if (typeof data === 'string') {
                data = data.toUpperCase();
                var invalidToken = data.indexOf('INVALID APPID') > -1 || data.indexOf('TOKEN IS INVALID') > -1;
                return translateReqWithRefreshToken();
            }
            return data;
        });
    }

    return this.request;
};

/** @private */
Bing.prototype.parseData = function (data) {
    if (typeof data === 'string') {
        var lang = this.getCurrentLang();
        data = [{From: lang.langFrom, TranslatedText: data}];
    }
    return Bing.superclass.parseData.call(this, {
        langSource  : data[0]['From'],
        translation : data[0]['TranslatedText']
    });
};

Bing.prototype.refreshToken = function () {
    var dynamic = +Math.random().toString().substr(2);
    var landingPageUrl = 'http://www.bing.com/translator/dynamic/' + dynamic + '/js/LandingPage.js';
    return $.ajax({url: landingPageUrl, dataType: 'text'}).done(function (scriptText) {
        this.appId = scriptText.match(/appId\s*:\s*(["'])(.*?)\1/m)[2];
        APP.set('vendors.bing.appId', this.appId);
    }.bind(this));
};

/** @const */
var LANGUAGES = {
    "auto"  : "Auto-detect",
    "ar"    : "Arabic",
    "bg"    : "Bulgarian",
    "ca"    : "Catalan",
    "zh-CHS": "Chinese (Simplified)",
    "zh-CHT": "Chinese (Traditional)",
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