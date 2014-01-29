'use strict';

var inherit = require('../utils').inherit,
    ScrollBar = require('../ui/scroll_bar').ScrollBar,
    FlyingPanel = require('../ui/flying_panel').FlyingPanel,
    TranslationResult = require('./translation_result').TranslationResult;

/**
 * @constructor
 */
var Popup = function (options) {
    Popup.superclass.constructor.call(this, options = options || {});
    this.createDom();
    this.parseData(options.data);
};

inherit(Popup, FlyingPanel);

/** @private */
Popup.prototype.createDom = function () {
    this.$container.addClass('popup');
    this.translationResult = new TranslationResult({showFullData: false}).appendTo(this);
    this.scrollBar = new ScrollBar({$parent: this.$container});
};

Popup.prototype.parseData = function (data) {
    if (!data) return;
    this.translationResult.parseData(data);
    this.scrollBar.update();
};

exports.Popup = Popup;