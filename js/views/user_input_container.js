'use strict';

var UTILS = require('../utils'),
    inherit = require('../utils').inherit,
    VendorDataView = require('./vendor_data_view').VendorDataView,
    VendorLanguageSelect = require('./vendor_language_select').VendorLanguageSelect,
    UIComponent = require('../ui/ui_component').UIComponent;

/** @const */
var ACTIVE_VENDOR_CLASS = 'active';
var UNAVAILABLE_VENDOR_CLASS = 'unavailable';

/**
 * @constructor
 */
var UserInputContainer = function (options) {
    UserInputContainer.superclass.constructor.call(this, options);

    this.activeVendor = APP.vendor.name;
    this.vendors = [];

    this.createDom();
    this.bindEvents();
    this.refreshFastSwitchingBlock();
};

inherit(UserInputContainer, UIComponent);

/** @private */
UserInputContainer.prototype.createDom = function () {
    this.$container.addClass('userInputContainer');

    this.selectLang = new VendorLanguageSelect().appendTo(this.$container);
    this.$vendors = $('<div class="vendors"><i class="title">' + __(66) + ': </i></div>').appendTo(this.$container);
    this.$text = $('<textarea tabindex="1"/>').attr('placeholder', __(63)).appendTo(this.$container);
    this.dataView = new VendorDataView().hide().appendTo(this);

    APP.vendors.forEach(function (vendor) {
        var vendorData = {
            name : vendor.name,
            $link: $('<span class="vendorLink"><b></b></span>').appendTo(this.$vendors)
        };
        vendorData.$link
            .toggleClass(ACTIVE_VENDOR_CLASS, vendor.name === this.activeVendor)
            .find('b')
                .text(vendor.title)
                .on('click', this.fastSwitchTo.bind(this, vendor.name));

        this.vendors.push(vendorData);
    }, this);
};

/** @private */
UserInputContainer.prototype.bindEvents = function () {
    this.selectLang.on('swap', this.focus.bind(this));

    this.onTranslationDone = this.onTranslationDone.bind(this);
    this.translateTextLazy = UTILS.debounce(this.translateText.bind(this), 250);

    this.$text.on('input', this.onInput.bind(this));
    this.dataView
        .on('playText', this.onPlayText.bind(this))
        .on('linkClick', this.onLinkClick.bind(this));

    var onVendorChange = this.onVendorChange.bind(this);
    APP.on('change:settingsContainer.vendorBlock.activeVendor', onVendorChange);
    APP.on('change:settingsContainer.vendorBlock.langFrom', onVendorChange);
    APP.on('change:settingsContainer.vendorBlock.langTo', onVendorChange);
};

/** @private */
UserInputContainer.prototype.fastSwitchTo = function (vendorName) {
    if (vendorName === this.activeVendor) return;
    this.activeVendor = vendorName;
    this.refreshFastSwitchingBlock();
    this.translateText();
    this.focus();
};

/** @private */
UserInputContainer.prototype.refreshFastSwitchingBlock = function () {
    var activeVendor = APP.getVendor(this.activeVendor);

    this.vendors.forEach(function (vendorData) {
        vendorData.active = vendorData.name === this.activeVendor;
        vendorData.available = !activeVendor.canUseCurrentLangWith(APP.getVendor(vendorData.name));
        vendorData.$link
          .toggleClass(UNAVAILABLE_VENDOR_CLASS, vendorData.available)
          .toggleClass(ACTIVE_VENDOR_CLASS, vendorData.active);
    }, this);
};

/** @private */
UserInputContainer.prototype.getText = function (text) {
    return (text || this.$text.val()).trim();
};

/** @private */
UserInputContainer.prototype.setText = function (text) {
    if (!text || this.getText() == text) return;
    this.$text.val(text)[0].setSelectionRange(text.length, text.length);
    this.translateText(text);
};

/** @private */
UserInputContainer.prototype.saveText = function (text) {
    if (!this.state.rememberText) {
        if (this.state.text) this.state.text = '';
        return;
    }
    this.state.text = text;
};

/** @private */
UserInputContainer.prototype.translateText = function (text) {
    if (text = this.getText(text)) {
        this.saveText(text);
        APP.getVendor(this.activeVendor).translateText(text).done(this.onTranslationDone);
    }
    return text;
};

/** @private */
UserInputContainer.prototype.onPlayText = function () {
    APP.getVendor(this.activeVendor).playText();
    this.focus();
};

/** @private */
UserInputContainer.prototype.onVendorChange = function () {
    this.refreshFastSwitchingBlock();
    this.translateTextLazy();
};

/** @private */
UserInputContainer.prototype.onLinkClick = function (text) {
    this.setText(text);
    window.scrollTo(0, 0);
};

/** @private */
UserInputContainer.prototype.onInput = function () {
    this.translateTextLazy();
    if (!this.getText()) {
        this.saveText('');
        this.dataView.hide();
    }
};

/** @private */
UserInputContainer.prototype.onTranslationDone = function (data) {
    if (data.sourceText !== this.getText() || data.vendor !== this.activeVendor) return;
    this.dataView.parseData(data).show();
    if (document.activeElement === this.$text[0]) this.focus();
};

UserInputContainer.prototype.show = function () {
    UserInputContainer.superclass.show.apply(this, arguments);
    if (this.state.rememberText) this.setText(this.state.text);
    this.focus();
};

/** @private */
UserInputContainer.prototype.focus = function () {
    this.$text.focus();
};

exports.UserInputContainer = UserInputContainer;