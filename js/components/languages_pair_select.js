'use strict';

var inherit = require('../utils').inherit,
    Select = require('../ui/select').Select,
    UIComponent = require('../ui/ui_component').UIComponent;

/**
 * @constructor
 */
var LanguagesPairSelect = function (options) {
    LanguagesPairSelect.superclass.constructor.call(this, options);

    this.autoDetect = 'auto';
    this.langFrom = this.state['langFrom'] || this.autoDetect;
    this.langTo = this.state['langTo'] || this.getNavigatorLang();

    this.createDom();
    this.bindEvents();
};

inherit(LanguagesPairSelect, UIComponent);

/** @private */
LanguagesPairSelect.prototype.createDom = function () {
    this.$container.addClass('languagesPairSelect');

    /** @type {jQuery} */ this.$from = $('<img class="flagFrom"/>').appendTo(this.$container);
    /** @type {Select} */ this.from = new Select({className: 'langFrom', noBodyAppend: true}).appendTo(this.$container);
    /** @type {jQuery} */ this.$swapLang = $('<span class="swapLang"><i class="line"/></span>').attr('title', __(14)).appendTo(this.$container);
    /** @type {jQuery} */ this.$to = $('<img class="flagTo"/>').appendTo(this.$container);
    /** @type {Select} */ this.to = new Select({className: 'langTo', noBodyAppend: true}).appendTo(this.$container);
};

/** @private */
LanguagesPairSelect.prototype.bindEvents = function () {
    this.from.on('change', this.onChangeLangFrom, this);
    this.to.on('change', this.onChangeLangTo, this);
    this.$swapLang.on('click', this.onSwapLanguages.bind(this));
};

LanguagesPairSelect.prototype.getNavigatorLang = function () {
    return navigator.language.split('-')[0];
};

/**
 * Get the source of the image with flag
 * @param {string} flag
 * @returns {string} URL relative to project root
 */
LanguagesPairSelect.prototype.getFlagUrl = function (flag) {
    return '/img/flags/' + flag.split('-')[0] + '.png';
};

/**
 * Fill the select boxes with available languages
 * @param {Object} langList List of languages from translation vendor (iso:name)
 */
LanguagesPairSelect.prototype.setLangList = function (langList) {
    var langsFrom = Object.keys(langList),
        langsTo = langsFrom.slice(langsFrom[0] == this.autoDetect ? 1 : 0);

    if (!langList[this.langFrom]) this.langFrom = langsFrom[0];
    if (!langList[this.langTo]) this.langTo = langsTo[0];

    // possible fix after switching vendors
    if (this.langFrom == this.langTo) {
        var langTo = langsTo[1];
        var navLang = this.getNavigatorLang();
        if (this.langFrom !== navLang && langsTo.indexOf(navLang) > -1) langTo = navLang;
        this.langTo = langTo;
    }

    this.from.clear();
    this.to.clear();

    langsFrom.forEach(function (lang) {
        this.from.add({
            value   : lang,
            title   : langList[lang],
            selected: lang == this.langFrom
        }, true);
    }, this);

    langsTo.forEach(function (lang) {
        this.to.add({
            value   : lang,
            title   : langList[lang],
            selected: lang == this.langTo
        }, true);
    }, this);

    this.setLangFrom();
    this.setLangTo();
};

LanguagesPairSelect.prototype.setLangFrom = function (lang, silent) {
    lang = lang || this.langFrom;

    var changed = this.langFrom != lang;
    this.langFrom = lang;
    this.from.selectByValue(lang, true);
    this.$from.attr('src', this.getFlagUrl(lang));
    this.disableMirrorLang(this.to, lang);

    if (changed && !silent) {
        this.onChange();
        this.trigger('langFrom', lang);
    }
};

LanguagesPairSelect.prototype.setLangTo = function (lang, silent) {
    lang = lang || this.langTo;

    var changed = this.langTo != lang;
    this.langTo = lang;
    this.to.selectByValue(lang, true);
    this.$to.attr('src', this.getFlagUrl(lang));
    this.disableMirrorLang(this.from, lang);

    if (changed && !silent) {
        this.onChange();
        this.trigger('langTo', lang);
    }
};

/** @private */
LanguagesPairSelect.prototype.onChange = function () {
    this.trigger('change', this.langFrom, this.langTo);
};

/**
 * Don't give a chance to choose the same languages in "from" and "to" fields
 * @param {Select} select
 * @param {String} lang
 */
LanguagesPairSelect.prototype.disableMirrorLang = function (select, lang) {
    select.itemList.enable(select._getItemBy('disabled', true));
    select.itemList.disable(select._getItemBy('value', lang));
};

/** @private */
LanguagesPairSelect.prototype.onChangeLangFrom = function (value) {
    this.setLangFrom(value);
};

/** @private */
LanguagesPairSelect.prototype.onChangeLangTo = function (value) {
    this.setLangTo(value);
};

/** @private */
LanguagesPairSelect.prototype.onSwapLanguages = function () {
    if (this.langFrom == this.autoDetect) return;
    this.setLangPair(this.langTo, this.langFrom);
};

LanguagesPairSelect.prototype.setLangPair = function (langFrom, langTo, silent) {
    this.setLangTo(this.autoDetect, true); // reset
    this.setLangFrom(langFrom, silent);
    this.setLangTo(langTo, silent);
};

LanguagesPairSelect.prototype.getState = function () {
    return {
        'langFrom': this.langFrom,
        'langTo': this.langTo
    };
};

exports.LanguagesPairSelect = LanguagesPairSelect;