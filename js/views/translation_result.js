'use strict';

var inherit = require('../utils').inherit,
    UIComponent = require('../ui/ui_component').UIComponent;

/**
 * @constructor
 */
var TranslationResult = function (options) {
    options = $.extend({showFullData: true}, options);
    TranslationResult.superclass.constructor.call(this, options);

    this.showFullData = options.showFullData;
    this.createDom();
    this.bindEvents();
    this.refreshPlayIcon();
};

inherit(TranslationResult, UIComponent);

/** @private */
TranslationResult.prototype.createDom = function () {
    this.$container.addClass('translationResult');

    this.$playSound = $('<i class="playIcon"/>')
        .css('backgroundImage', APP.extension.getImageURL('img/sound.png'))
        .attr('title', __(48))
        .appendTo(this.$container);

    this.$translation = $('<div class="translation"/>').appendTo(this.$container);
    this.$dictionary = $('<dl class="dictionary"/>').appendTo(this.$container);
};

/** @private */
TranslationResult.prototype.bindEvents = function () {
    this.$playSound.on('click', this.onPlayIconClick.bind(this));
    this.$container.on('click', '.link', this.onLinkTextClick.bind(this));
    APP.on('change:settingsContainer.popupDefinitions.showPlayIcon', this.refreshPlayIcon, this);
    APP.on('change:settingsContainer.vendorBlock.activeVendor', this.refreshPlayIcon, this);
};

/**
 * Parse data response from the vendor and show results
 * @param {Object} data
 */
TranslationResult.prototype.parseData = function (data) {
    var lang = data.langSource;
    var title = lang ? __(49, [APP.vendor.langList[lang], APP.vendor.title]) : '';

    this.sourceText = data.sourceText;
    this.$translation.text(data.translation).attr('title', title);
    this.$dictionary.empty();

    data.dictionary.forEach(this.addDictionary, this);
    this.spellCorrection(data.spellCheck);
    return this;
};

/** @private */
TranslationResult.prototype.addDictionary = function (dict) {
    var links = [];
    var $wordType = $('<dt class="partOfSpeech"/>').text(dict.partOfSpeech).appendTo(this.$dictionary);
    var $wordMeanings = $('<dd class="wordMeanings"/>').appendTo(this.$dictionary);

    if (!dict.similarWords) $wordMeanings.html(dict.translation.join(', '));
    else {
        if (this.showFullData) {
            $wordMeanings.addClass('tableView');
            links = dict.similarWords.map(function (translation) {
                return [
                    '<div class="rowView">',
                        '<span class="wordMain">' + translation.word + '</span>',
                        '<span class="wordSimilar">' + translation.meanings.map(this.wrapLink).join(', ') + '</span>',
                    '</div>'
                ].join('');
            }, this);
            $wordMeanings.html(links.join(''));
        }
        else {
            links = dict.similarWords.map(function (translation) {
                return this.wrapHint(translation.word, translation.meanings.join(', '));
            }, this);
            $wordMeanings.html(links.join(', '));
        }
    }
};

/** @private */
TranslationResult.prototype.spellCorrection = function (suggestedText) {
    if (!suggestedText) return;
    var text = __(47, [this.wrapLink(suggestedText)]);
    $('<div class="spellChecker"/>').html(text).appendTo(this.$dictionary);
};

/** @private */
TranslationResult.prototype.wrapLink = function (text) {
    return '<span class="link">' + text + '</span>';
};

/** @private */
TranslationResult.prototype.wrapHint = function (text, title) {
    title = title || '';
    return '<span class="hint"' + (title ? 'title="' + title + '"' : '') + '>' + text + '</span>';
};

/** @private */
TranslationResult.prototype.onLinkTextClick = function (e) {
    this.trigger('linkClick', $(e.target).text());
};

/** @private */
TranslationResult.prototype.onPlayIconClick = function (e) {
    if (!this.sourceText) return;
    APP.vendor.playText(this.sourceText);
    this.trigger('playSound', this.sourceText);
};

/** @private */
TranslationResult.prototype.refreshPlayIcon = function () {
    var showIcon = APP.get('settingsContainer.popupDefinitions.showPlayIcon');
    var featureAvail = APP.vendor.textToSpeech;
    this.$playSound.toggle(showIcon && featureAvail);
};

exports.TranslationResult = TranslationResult;