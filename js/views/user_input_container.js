'use strict';

var UTILS = require('../utils'),
    inherit = require('../utils').inherit,
    TranslationResult = require('./translation_result').TranslationResult,
    LanguagesPairSelect = require('./languages_pair_select').LanguagesPairSelect,
    UIComponent = require('../ui/ui_component').UIComponent;

/**
 * @constructor
 */
var UserInputContainer = function (options) {
    UserInputContainer.superclass.constructor.call(this, options);

    this.createDom();
    this.bindEvents();
    this.onTranslationDone = this.onTranslationDone.bind(this);
    this.onTranslationFail = console.error.bind(console, 'Translation failed');
};

inherit(UserInputContainer, UIComponent);

/** @private */
UserInputContainer.prototype.createDom = function () {
    this.$container.addClass('userInputContainer');

    this.langPairSelect = new LanguagesPairSelect().appendTo(this.$container);
    this.$text = $('<textarea/>').attr('placeholder', __(63)).appendTo(this.$container);
    this.result = new TranslationResult().hide().appendTo(this);
};

/** @private */
UserInputContainer.prototype.bindEvents = function () {
    this.$text.on('input', UTILS.debounce(this.onInput.bind(this), 250));
    this.result
        .on('playSound', this.focus.bind(this))
        .on('linkClick', this.onLinkTextClick.bind(this));
};

UserInputContainer.prototype.focus = function () {
    this.$text.focus();
};

/** @private */
UserInputContainer.prototype.onLinkTextClick = function (text) {
    var len = text.length;
    this.translateText(text);
    this.$text.val(text)[0].setSelectionRange(len, len);
    this.focus();
};

/** @private */
UserInputContainer.prototype.onInput = function (e) {
    var text = this.$text.val().trim();
    if (text) this.translateText(text);
    else this.result.hide();

};

UserInputContainer.prototype.translateText = function (text) {
    return APP.vendor.translateText(text)
        .done(this.onTranslationDone)
        .fail(this.onTranslationFail);
};

/** @private */
UserInputContainer.prototype.onTranslationDone = function (data) {
    this.result.parseData(data).show();
};

UserInputContainer.prototype.show = function () {
    UserInputContainer.superclass.show.apply(this, arguments);
    this.$text.focus();
};

exports.UserInputContainer = UserInputContainer;