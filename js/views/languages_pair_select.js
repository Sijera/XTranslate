'use strict';

var inherit = require('../utils').inherit,
    Select = require('../ui/select').Select,
    UIComponent = require('../ui/ui_component').UIComponent;

/**
 * @constructor
 */
var LanguagesPairSelect = function (options) {
    LanguagesPairSelect.superclass.constructor.call(this, options);

    this.state = APP.get('settingsContainer.vendorBlock');
    this.createDom();
    this.bindEvents();
    this.refresh();
};

inherit(LanguagesPairSelect, UIComponent);

/** @private */
LanguagesPairSelect.prototype.createDom = function () {
    this.$container.addClass('languagesPairSelect');

    this.$langFrom = $('<img class="flagFrom"/>').appendTo(this.$container);
    this.langFrom = new Select({className: 'langFrom', noBodyAppend: true}).appendTo(this.$container);
    this.$swapLang = $('<span class="swapLang"><i class="line"/></span>').attr('title', __(14)).appendTo(this.$container);
    this.$langTo = $('<img class="flagTo"/>').appendTo(this.$container);
    this.langTo = new Select({className: 'langTo', noBodyAppend: true}).appendTo(this.$container);
};

/** @private */
LanguagesPairSelect.prototype.bindEvents = function () {
    this.langFrom.on('change', this.setLangFrom.bind(this));
    this.langTo.on('change', this.setLangTo.bind(this));
    this.$swapLang.on('click', this.onSwapLangPair.bind(this));

    APP.on('change:settingsContainer.vendorBlock.activeVendor', this.refresh.bind(this));
    APP.on('change:settingsContainer.vendorBlock.langFrom', this.setLangFrom.bind(this));
    APP.on('change:settingsContainer.vendorBlock.langTo', this.setLangTo.bind(this));
};

/**
 * Refresh the select boxes from active translation vendor
 */
LanguagesPairSelect.prototype.refresh = function () {
    var langList = APP.vendor.langList,
        langListFrom = Object.keys(langList),
        langListTo = langListFrom.slice(langListFrom[0] == APP.vendor.autoDetect ? 1 : 0),
        langFrom = this.state.langFrom,
        langTo = this.state.langTo;

    if (!langList[langFrom]) langFrom = langListFrom[0];
    if (!langList[langTo]) langTo = langListTo[0];
    if (langFrom == langTo) langTo = langListTo[1];

    this.langFrom.clear();
    this.langTo.clear();

    langListFrom.forEach(function (lang) {
        this.langFrom.add({value: lang, title: langList[lang], selected: lang == langFrom}, true);
    }, this);

    langListTo.forEach(function (lang) {
        this.langTo.add({value: lang, title: langList[lang], selected: lang == langTo}, true);
    }, this);

    this.setLangFrom(langFrom);
    this.setLangTo(langTo);
};

LanguagesPairSelect.prototype.setLangFrom = function (lang) {
    this.state.langFrom = lang;
    this.langFrom.selectByValue(lang, true);
    this.$langFrom.attr('src', this.getFlagUrl(lang));
    this.disableMirrorLang(this.langTo, lang);
};

LanguagesPairSelect.prototype.setLangTo = function (lang) {
    this.state.langTo = lang;
    this.langTo.selectByValue(lang, true);
    this.$langTo.attr('src', this.getFlagUrl(lang));
    this.disableMirrorLang(this.langFrom, lang);
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
 * Don't give a chance to choose the same languages in "from" and "to" fields
 * @param {Select} select
 * @param {String} lang
 */
LanguagesPairSelect.prototype.disableMirrorLang = function (select, lang) {
    select.itemList.enable(select._getItemBy('disabled', true));
    select.itemList.disable(select._getItemBy('value', lang));
};

/** @private */
LanguagesPairSelect.prototype.onSwapLangPair = function () {
    var langFrom = this.state.langFrom,
        langTo = this.state.langTo,
        autoDetect = APP.vendor.autoDetect;
    if (langFrom == autoDetect) return;

    this.setLangFrom(autoDetect);
    this.setLangTo(langFrom);
    this.setLangFrom(langTo);
};

exports.LanguagesPairSelect = LanguagesPairSelect;