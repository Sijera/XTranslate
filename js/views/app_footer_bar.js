'use strict';

var UTILS = require('../utils'),
    inherit = require('../utils').inherit,
    UIComponent = require('../ui/ui_component').UIComponent;

/**
 * @constructor
 */
var AppFooterBar = function (options) {
    AppFooterBar.superclass.constructor.call(this, options);

    this.rateLink = '';
    this.donateLink = '';

    this.createDom();
};

inherit(AppFooterBar, UIComponent);

/** @private */
AppFooterBar.prototype.getHtmlLink = function (url, text) {
    return UTILS.sprintf('<a href="{0}">{1}</a>', url, text);
};

/** @private */
AppFooterBar.prototype.createDom = function () {
    this.$container.addClass('appFooterBar');

    this.$container.append(UTILS.sprintf(__(60),
        this.getHtmlLink(this.rateLink, __(61)),
        this.getHtmlLink(this.donateLink, __(62))
    ));
};

exports.AppFooterBar = AppFooterBar;