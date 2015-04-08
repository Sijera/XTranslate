'use strict';

var inherit = require('../utils').inherit,
    UIComponent = require('../ui/ui_component').UIComponent;

/**
 * @constructor
 */
var VendorDataView = function (options) {
    options = $.extend({showFullData: true}, options);
    VendorDataView.superclass.constructor.call(this, options);

    this.showFullData = options.showFullData;

    this.createDom();
    this.bindEvents();
    this.refreshPlayIcon();
};

inherit(VendorDataView, UIComponent);

/** @private */
VendorDataView.prototype.createDom = function () {
    this.$container.addClass('vendorDataView');

    this.$playSound = $('<i class="playIcon fa-volume-up"/>').appendTo(this.$container);
    this.$translation = $('<span class="translation"/>').appendTo(this.$container);
    this.$dictionary = $('<dl class="dictionary"/>').appendTo(this.$container);
};

/** @private */
VendorDataView.prototype.bindEvents = function () {
    this.$playSound.on('click', this.onPlayIconClick.bind(this));
    this.$container.on('click', '.link', this.onLinkClick.bind(this));
    APP.on('change:settingsContainer.popupDefinitions.showPlayIcon', this.refreshPlayIcon, this);
};

/**
 * Parse the translation data into HTML-layout
 * @param {Object} data
 * @return VendorDataView
 */
VendorDataView.prototype.parseData = function (data) {
    var vendor = APP.getVendor(data.vendor),
        lang = data.langSource,
        ts = data.transcription,
        title = lang ? __(49, [vendor.getLangSet()[lang], vendor.title]) : '',
        spellCheckData = APP.get('settingsContainer.popupDefinitions.spellCheck') ? data.spellCheck : null;

    this.$playSound
        .attr('title', __(48) + ': ' + data.sourceText)
        .toggleClass('disabled', !data.ttsEnabled);

    this.$translation
        .text(data.translation)
        .attr('title', title)
        .append(ts ? ' <i class="ts">' + ts + '</i>' : undefined);

    this.$dictionary.empty();
    (data.dictionary || []).forEach(this.addDictionary, this);
    this.spellCorrection(spellCheckData);

    return this;
};

/** @private */
VendorDataView.prototype.addDictionary = function (dict) {
    var links = [];
    var $wordType = $('<dt class="partOfSpeech"/>').text(dict.partOfSpeech).appendTo(this.$dictionary);
    var $wordMeanings = $('<dd class="wordMeanings"/>').appendTo(this.$dictionary);

    if (!dict.similarWords) $wordMeanings.html(dict.translation.join(', '));
    else {
        if (this.showFullData) {
            $wordMeanings.addClass('tableView');
            links = dict.similarWords.map(function (translation) {
                var ex = translation.examples;
                var examples = (ex || '').length ? ' <span class="example" title="' + ex.join('\n') + '">*</span>' : '';
                return [
                    '<div class="rowView">',
                        '<span class="wordMain">' + translation.word + examples + '</span>',
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
VendorDataView.prototype.spellCorrection = function (suggestedText) {
    if (!suggestedText) return;
    var text = this.wrapLink(suggestedText);
    $('<div class="spellChecker"/>').html(__(47, [text])).appendTo(this.$dictionary);
};

/** @private */
VendorDataView.prototype.wrapLink = function (text) {
    return '<span class="link">' + text + '</span>';
};

/** @private */
VendorDataView.prototype.wrapHint = function (text, title) {
    title = title || '';
    return '<span class="hint"' + (title ? 'title="' + title + '"' : '') + '>' + text + '</span>';
};

/** @private */
VendorDataView.prototype.onLinkClick = function (e) {
    this.trigger('linkClick', $(e.currentTarget).text());
};

/** @private */
VendorDataView.prototype.onPlayIconClick = function (e) {
    this.trigger('playText');
};

/** @private */
VendorDataView.prototype.refreshPlayIcon = function () {
    this.showPlayIcon = APP.get('settingsContainer.popupDefinitions.showPlayIcon');
    this.$playSound.toggle(this.showPlayIcon);
};

exports.VendorDataView = VendorDataView;