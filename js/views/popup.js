'use strict';

var inherit = require('../utils').inherit,
    ScrollBar = require('../ui/scroll_bar').ScrollBar,
    FlyingPanel = require('../ui/flying_panel').FlyingPanel,
    VendorDataView = require('./vendor_data_view').VendorDataView;

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
    this.translationResult = new VendorDataView({showFullData: false}).appendTo(this);
    this.scrollBar = new ScrollBar({$parent: this.$container});
};

Popup.prototype.parseData = function (data) {
    if (!data) return;
    this.translationResult.parseData(data);
    this.scrollBar.update();
};

exports.Popup = Popup;