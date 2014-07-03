'use strict';

var inherit = require('../utils').inherit,
    Select = require('../ui/select').Select,
    UIComponent = require('../ui/ui_component').UIComponent;

/**
 * @constructor
 */
var VendorLanguageSelect = function (options) {
    VendorLanguageSelect.superclass.constructor.call(this, options);

    this.state = APP.get('settingsContainer.vendorBlock');
    this.createDom();
    this.bindEvents();
    this.refresh();
};

inherit(VendorLanguageSelect, UIComponent);

/** @private */
VendorLanguageSelect.prototype.createDom = function () {
    this.$container.addClass('vendorLanguageSelect');

    this.$langFrom = $('<span class="flagFrom"/>').appendTo(this.$container);
    this.langFrom = new Select({className: 'langFrom', noBodyAppend: true}).appendTo(this.$container);
    this.$swapLang = $('<span class="swapLang"><i class="line"/></span>').attr('title', __(14)).appendTo(this.$container);
    this.$langTo = $('<span class="flagTo"/>').appendTo(this.$container);
    this.langTo = new Select({className: 'langTo', noBodyAppend: true}).appendTo(this.$container);
};

/** @private */
VendorLanguageSelect.prototype.bindEvents = function () {
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
VendorLanguageSelect.prototype.refresh = function () {
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

VendorLanguageSelect.prototype.setLangFrom = function (lang) {
    var autoDetect = APP.vendor.autoDetect === lang;
    this.state.langFrom = lang;
    this.langFrom.selectByValue(lang, true);
    this.$langFrom.css(this.getFlagAttr(lang, autoDetect));
    this.$langFrom.toggleClass('fa-gear', autoDetect);
    this.disableMirrorLang(this.langTo, lang);
};

VendorLanguageSelect.prototype.setLangTo = function (lang) {
    this.state.langTo = lang;
    this.langTo.selectByValue(lang, true);
    this.$langTo.css(this.getFlagAttr(lang));
    this.disableMirrorLang(this.langFrom, lang);
};

/**
 * Get the source of the image with flag
 * @param {string} flag
 * @param {boolean} [autoDetect]
 */
VendorLanguageSelect.prototype.getFlagAttr = function (flag, autoDetect) {
    var bgcImage = autoDetect ? 'none' : 'url(/img/flags/' + flag.split('-')[0] + '.png)';
    return {backgroundImage: bgcImage};
};

/**
 * Don't give a chance to choose the same languages in "from" and "to" fields
 * @param {Select} select
 * @param {String} lang
 */
VendorLanguageSelect.prototype.disableMirrorLang = function (select, lang) {
    select.itemList.enable(select._getItemBy('disabled', true));
    select.itemList.disable(select._getItemBy('value', lang));
};

/** @private */
VendorLanguageSelect.prototype.onSwapLangPair = function () {
    var langFrom = this.state.langFrom,
        langTo = this.state.langTo,
        autoDetect = APP.vendor.autoDetect;
    if (langFrom == autoDetect) return;

    this.setLangFrom(autoDetect);
    this.setLangTo(langFrom);
    this.setLangFrom(langTo);
    this.trigger('swap');
};

exports.VendorLanguageSelect = VendorLanguageSelect;