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
    this.$dictionaries = $('<div class="dictionaries"/>').appendTo(this.$container);
    this.scrollBar = new ScrollBar({$parent: this.$container});
};

/** @private */
Popup.prototype.bindEvents = function () {
    this.$playSound.on('click', this.onPlayIconClick.bind(this));
    this.$container.on('click', '.link', this.onLinkTextClick.bind(this));
    APP.on('vendorChange playIconToggle', this.refreshPlayIcon, this);
};

/**
 * Parse data from translation vendor and update pop-up content
 * @param {Object} data
 */
Popup.prototype.parseData = function (data) {
    var vendor = APP.data('vendor');

    /** @type {String} */ this.sourceText = data['sourceText'];
    /** @type {Boolean} */ this.showSimilar = data['showSimilar'];
    /** @type {String} */ var lang = data['langDetected'];
    /** @type {String} */ var translation = data['translation'];
    /** @type {Array=} */ var dictionary = data['dictionary'] || [];
    /** @type {String} */ var textCorrection = data['correction'];

    this.$container.attr('title', lang ? __(49, [lang, vendor.title]) : '');
    this.$main.text(translation);
    this.$dictionaries.empty();

    dictionary.forEach(this.addDictionaryPart, this);
    this.addTextCorrection(textCorrection);
    this.scrollBar.scrollTo(0, true);
    this.scrollBar.update();

    return this;
};

/** @private */
Popup.prototype.addDictionaryPart = function (data) {
    /** @type {String} */ var partOfSpeech = data[0];
    /** @type {Array.<Array(String, Array)>} */ var wordData = data[1];
    /** @type {Array=} */ var wordMeanings = wordData.map(function (a) { return $.isArray(a) ? a[0] : a });

    var $dictionary = $('<div class="dictionary"/>').appendTo(this.$dictionaries);
    var $wordType = $('<div class="wordType"/>').text(partOfSpeech).appendTo($dictionary);
    var $wordMeanings = $('<div class="wordMeanings"/>').appendTo($dictionary);

    if (!this.showSimilar) $wordMeanings.text(wordMeanings.join(', '));
    else {
        $wordMeanings.addClass('extended');
        wordData.forEach(function (a, i) {
            var wordMeaning = wordMeanings[i];
            var wordSimilar = $.isArray(a[1]) ? a[1].map(this.wrapLink, this).join(', ') : '';
            $wordMeanings.append(
                '<div class="wordMeaning">' + wordMeaning + '</div>',
                '<div class="wordSimilar">' + wordSimilar + '</div>'
            );
        }, this);
    }
};

/** @private */
Popup.prototype.addTextCorrection = function (suggestedText) {
    if (!suggestedText) return;
    var text = __(47, [this.wrapLink(suggestedText)]);
    $('<div class="correction"/>').text(text).appendTo(this.$dictionaries);
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
    this.trigger('play', this.sourceText);
};

/** @private */
Popup.prototype.refreshPlayIcon = function () {
    var boxChecked = APP.data('useTextToSpeech');
    var supported = APP.data('vendor').tts;
    this.$playSound.toggle(boxChecked && supported);
};

exports.Popup = Popup;