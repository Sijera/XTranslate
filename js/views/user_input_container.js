'use strict';

var UTILS = require('../utils'),
    inherit = require('../utils').inherit,
    VendorDataView = require('./vendor_data_view').VendorDataView,
    VendorLanguageSelect = require('./vendor_language_select').VendorLanguageSelect,
    UIComponent = require('../ui/ui_component').UIComponent;

/** @const */
var ACTIVE_VENDOR_CLASS = 'active';

/**
 * @constructor
 */
var UserInputContainer = function (options) {
    UserInputContainer.superclass.constructor.call(this, options);

    this.activeVendor = APP.vendor.name;
    this.vendors = [];

    this.createDom();
    this.bindEvents();
};

inherit(UserInputContainer, UIComponent);

/** @private */
UserInputContainer.prototype.createDom = function () {
    this.$container.addClass('userInputContainer');

    this.selectLang = new VendorLanguageSelect().appendTo(this.$container);
    this.$vendors = $('<div class="vendors"><i class="title">' + __(66) + ': </i></div>').appendTo(this.$container);
    this.$text = $('<textarea/>').attr('placeholder', __(63)).appendTo(this.$container);
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
                .on('click', this.setVendor.bind(this, vendor.name))

        this.vendors.push(vendorData);
    }, this);
};

/** @private */
UserInputContainer.prototype.bindEvents = function () {
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
UserInputContainer.prototype.setVendor = function (vendorName) {
    if (vendorName === this.activeVendor) return;
    this.activeVendor = this.dataView.activeVendor = vendorName;
    this.vendors.forEach(function (vendorData) {
        vendorData.$link.toggleClass(ACTIVE_VENDOR_CLASS, vendorData.name === vendorName);
    });

    this.translateText();
    this.$text.focus();
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
        if (this.transTextReq && this.transTextReq.state() == 'pending') this.transTextReq.reject();
        this.transTextReq = APP.getVendor(this.activeVendor).translateText(text).done(this.onTranslationDone);
    }
    return text;
};

/** @private */
UserInputContainer.prototype.onPlayText = function () {
    APP.getVendor(this.activeVendor).playText();
    this.$text.focus();
};

/** @private */
UserInputContainer.prototype.onVendorChange = function () {
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
    if (!this.getText()) return;
    this.dataView.parseData(data).show();
    if (document.activeElement === this.$text[0]) this.$text.blur().focus();
};

UserInputContainer.prototype.show = function () {
    UserInputContainer.superclass.show.apply(this, arguments);
    if (this.state.rememberText) this.setText(this.state.text);
    this.$text.focus();
};

exports.UserInputContainer = UserInputContainer;