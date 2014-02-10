'use strict';

var inherit = require('../utils').inherit,
    themeToCSS = require('../theme').toCSS,
    ScrollBar = require('../ui/scroll_bar').ScrollBar,
    FlyingPanel = require('../ui/flying_panel').FlyingPanel,
    VendorDataView = require('./vendor_data_view').VendorDataView;

/**
 * @constructor
 */
var Popup = function (options) {
    options = $.extend({autoSize: false, autoHide: true}, options);
    Popup.superclass.constructor.call(this, options);
    this.createDom();
};

inherit(Popup, FlyingPanel);

/** @private */
Popup.prototype.createDom = function () {
    this.$container.addClass('popup');
    this.dataView = new VendorDataView({showFullData: false}).appendTo(this);
    this.scrollBar = new ScrollBar({$parent: this.$container});
};

/**
 * Parse data from vendor and refresh popup contents
 * @param {Object} data
 * @return {Popup}
 */
Popup.prototype.parseData = function (data) {
    if (!data) return this;
    this.dataView.parseData(data);
    this.scrollBar.update();
    return this;
};

/**
 * Convert theme to CSS and apply to the popup
 * @param {Object|*} [theme]
 * @return {Object} Has been used theme
 */
Popup.prototype.applyTheme = function (theme) {
    if (!theme) {
        var popup = APP.get('settingsContainer.popupStyle');
        theme = popup.activeTheme ? popup.themes[popup.activeTheme] : popup.customTheme;
    }
    this.$container.css(themeToCSS(theme));
    return theme;
};

exports.Popup = Popup;