'use strict';

var inherit = require('../utils').inherit,
    sprintf = require('../utils').sprintf,
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
AppFooterBar.prototype.createDom = function () {
    this.$container.addClass('appFooterBar');

    this.text = sprintf.apply(null, [__(60),
        sprintf('<a href="{0}">{1}</a>', this.rateLink, __(61)),
        sprintf('<a href="{0}">{1}</a>', this.donateLink, __(62))
    ]);

    this.$container.append(this.text);
};

exports.AppFooterBar = AppFooterBar;