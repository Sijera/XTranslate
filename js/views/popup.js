'use strict';

var inherit = require('../utils').inherit,
    ScrollBar = require('../ui/scroll_bar').ScrollBar,
    FlyingPanel = require('../ui/flying_panel').FlyingPanel;

/**
 * @constructor
 */
var Popup = function (options) {
    Popup.superclass.constructor.call(this, options);

    this.createDom();
    this.bindEvents();
    this.refreshPlayIcon();
};

inherit(Popup, FlyingPanel);

/** @private */
Popup.prototype.createDom = function () {
    this.$container.addClass('popup');

    this.$playSound = $('<i class="playIcon"/>')
        .css('backgroundImage', APP.extension.getImageURL('img/sound.png'))
        .attr('title', __(48))
        .appendTo(this.$container);

    this.$main = $('<div class="main"/>').appendTo(this.$container);
    this.$dictionary = $('<dl class="dictionary"/>').appendTo(this.$container);
    this.scrollBar = new ScrollBar({$parent: this.$container});
};

/** @private */
Popup.prototype.bindEvents = function () {
    this.$playSound.on('click', this.onPlayIconClick.bind(this));
    this.$container.on('click', '.link', this.onLinkTextClick.bind(this));
    APP.on('change:settingsContainer.popupDefinitions.showPlayIcon', this.refreshPlayIcon, this);
    APP.on('change:settingsContainer.vendorBlock.activeVendor', this.refreshPlayIcon, this);
};

/**
 * Parse data from translation vendor and update content
 * @param {Object} data
 */
Popup.prototype.parseData = function (data) {
    this.sourceText = data.sourceText;
    this.$container.attr('title', data.langSource ? __(49, [data.langSource, APP.vendor.title]) : '');
    this.$main.text(data.translation);
    this.$dictionary.empty();

    data.dictionary.forEach(this.addDictionary, this);
    this.spellCorrection(data.spellCheck);
    this.scrollBar.update();

    return this;
};

/** @private */
Popup.prototype.addDictionary = function (dict) {
    var $wordType = $('<dt class="partOfSpeech"/>').text(dict.partOfSpeech).appendTo(this.$dictionary);
    var $wordMeanings = $('<dd class="wordMeanings"/>').appendTo(this.$dictionary);

    if (!dict.similarWords) {
        var links = dict.translation.map(this.wrapLink);
        $wordMeanings.html(links.join(', '));
    }
    else {
        dict.similarWords.forEach(function (translation) {
            var $word = $(this.wrapLink(translation.word)).appendTo($wordMeanings);
            $word.attr('title', translation.meanings.join(', '));
        }, this);
    }
};

/** @private */
Popup.prototype.spellCorrection = function (suggestedText) {
    if (!suggestedText) return;
    var text = __(47, [this.wrapLink(suggestedText)]);
    $('<div class="spellChecker"/>').text(text).appendTo(this.$dictionary);
};

/** @private */
Popup.prototype.wrapLink = function (text) {
    return '<span class="link">' + text + '</span>';
};

/** @private */
Popup.prototype.onLinkTextClick = function (e) {
    var text = $(e.target).text();
    this.trigger('translate', text);
};

/** @private */
Popup.prototype.onPlayIconClick = function (e) {
    if (!this.sourceText) return;
    APP.vendor.playText(this.sourceText);
};

/** @private */
Popup.prototype.refreshPlayIcon = function () {
    var showIcon = APP.get('settingsContainer.popupDefinitions.showPlayIcon');
    var featureAvail = APP.vendor.textToSpeech;
    this.$playSound.toggle(showIcon && featureAvail);
};

exports.Popup = Popup;