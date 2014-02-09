'use strict';

var UTILS = require('../utils'),
    inherit = require('../utils').inherit,
    VendorDataView = require('./vendor_data_view').VendorDataView,
    VendorLanguageSelect = require('./vendor_language_select').VendorLanguageSelect,
    UIComponent = require('../ui/ui_component').UIComponent;

/** @const */
var TRANSLATE_DELAY = 250;

/**
 * @constructor
 */
var UserInputContainer = function (options) {
    UserInputContainer.superclass.constructor.call(this, options);

    this.createDom();
    this.bindEvents();
};

inherit(UserInputContainer, UIComponent);

/** @private */
UserInputContainer.prototype.createDom = function () {
    this.$container.addClass('userInputContainer');

    this.langSelect = new VendorLanguageSelect().appendTo(this.$container);
    this.$text = $('<textarea/>').attr('placeholder', __(63)).appendTo(this.$container);
    this.result = new VendorDataView().hide().appendTo(this);
};

/** @private */
UserInputContainer.prototype.bindEvents = function () {
    this.onDone = this.onTranslationDone.bind(this);
    this.translateTextLazy = UTILS.debounce(this.translateText.bind(this), TRANSLATE_DELAY);

    this.$text.on('input', this.onInput.bind(this));
    this.result
        .on('playText', this.onPlayText.bind(this))
        .on('linkClick', this.onLinkTextClick.bind(this));

    var onVendorChange = this.onVendorChange.bind(this);
    APP.on('change:settingsContainer.vendorBlock.activeVendor', onVendorChange);
    APP.on('change:settingsContainer.vendorBlock.langFrom', onVendorChange);
    APP.on('change:settingsContainer.vendorBlock.langTo', onVendorChange);
};

UserInputContainer.prototype.onPlayText = function () {
    APP.vendor.playText();
    this.$text.focus();
};

/** @private */
UserInputContainer.prototype.onVendorChange = function () {
    this.translateTextLazy();
};

/** @private */
UserInputContainer.prototype.onLinkTextClick = function (text) {
    this.translateText(text);
    this.$text.val(text)[0].setSelectionRange(text.length, text.length);
    window.scrollTo(0, 0);
};

/** @private */
UserInputContainer.prototype.getText = function (text) {
    return (text || this.$text.val()).trim();
};

/** @private */
UserInputContainer.prototype.onInput = function (e) {
    this.translateTextLazy();
    if (!this.getText()) this.result.hide();
};

UserInputContainer.prototype.translateText = function (text) {
    text = this.getText(text);
    if (text) {
        this.sourceText = text;
        APP.vendor.translateText(text).done(this.onDone);
    }
};

/** @private */
UserInputContainer.prototype.onTranslationDone = function (data) {
    if (data.sourceText !== this.sourceText) return;
    this.result.parseData(data).show();
    this.$text.blur().focus(); // refresh page scrollbar (bugfix)
};

UserInputContainer.prototype.show = function () {
    UserInputContainer.superclass.show.apply(this, arguments);
    this.$text.focus();
};

exports.UserInputContainer = UserInputContainer;