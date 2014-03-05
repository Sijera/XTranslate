'use strict';

var inherit = require('../utils').inherit,
    toCSS = require('../theme').toCSS,
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

    /** @type {ScrollBar} */
    this.scrollBar = new ScrollBar({$parent: this.$container});

    /** @type {VendorDataView} */
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
    this.$container.css(toCSS(theme));
    return theme;
};

/** @private */
Popup.prototype.refreshDimensions = function () {
    var selection = window.getSelection();

    // A case, when the text has selected inside a form element, like <textarea> or <input>
    if (selection.isCollapsed && selection.toString()) this.setAnchor(document.activeElement);

    Popup.superclass.refreshDimensions.apply(this, arguments);
    if (!selection.isCollapsed) this.anchorRect = selection.getRangeAt(0).getBoundingClientRect();
};

Popup.prototype.update = function () {
    if (this.hidden) return;
    Popup.superclass.update.apply(this, arguments);
    this.scrollBar.scrollTo(0);
    this.scrollBar.update();
};

Popup.prototype.show = function () {
    Popup.superclass.show.apply(this, arguments);
    this.trigger('show');
};

Popup.prototype.focus = function () {
    this.$container.focus();
};

exports.Popup = Popup;