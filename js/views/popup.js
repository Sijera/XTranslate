'use strict';

var inherit = require('../utils').inherit,
    THEME = require('../theme'),
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

    this.scrollBar = new ScrollBar({$parent: this.$container});
    this.dataView = new VendorDataView({showFullData: false})
        .propagate('linkClick', this)
        .propagate('playText', this)
        .appendTo(this);
};

/**
 * Parse data from vendor and refresh popup contents
 * @param {Object} data
 * @return {Popup}
 */
Popup.prototype.parseData = function (data) {
    this.dataView.parseData(data);
    return this;
};

/**
 * Convert theme to CSS and apply to the popup
 * @param {Object|*} [theme]
 * @return {Object} Applied theme
 */
Popup.prototype.applyTheme = function (theme) {
    if (!theme) {
        var popup = APP.get('settingsContainer.popupStyle');
        theme = popup.activeTheme ? popup.themes[popup.activeTheme] : popup.customTheme;
    }
    this.$container.css(THEME.toCSS(theme));
    this.scrollBar.update();
    return theme;
};

/** @private */
Popup.prototype.refreshDimensions = function () {
    var selection = window.getSelection(),
        useActiveElem = selection.isCollapsed && selection.toString().trim();

    if (useActiveElem) this.setAnchor(document.activeElement);
    Popup.superclass.refreshDimensions.apply(this, arguments);
    if (!selection.isCollapsed) this.anchorRect = selection.getRangeAt(0).getBoundingClientRect();
};

Popup.prototype.show = function () {
    Popup.superclass.show.apply(this, arguments);
    this.scrollBar.scrollTo(0);
    this.scrollBar.update();
    this.$container.focus();
    return this;
};

exports.Popup = Popup;