'use strict';

var inherit = require('../utils').inherit,
    UIComponent = require('../ui/ui_component').UIComponent;

/** @const */
var STORE_URL = 'https://chrome.google.com/webstore/detail/gfgpkepllngchpmcippidfhmbhlljhoo';

/** @const */
var DONATE_URL = 'https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=NDM8RZ6PG5G6S&lc=US&item_name=XTranslate%20%28browser%20extension%29&item_number=2014&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted';

/**
 * @constructor
 */
var AppFooterBar = function (options) {
    AppFooterBar.superclass.constructor.call(this, options);

    var rateLink = this.getHtmlLink(STORE_URL, __(61));
    var donateLink = this.getHtmlLink(DONATE_URL, __(62));

    this.$container.addClass('appFooterBar');
    this.$container.append(__(60, [rateLink, donateLink]));
};

inherit(AppFooterBar, UIComponent);

/** @private */
AppFooterBar.prototype.getHtmlLink = function (url, text) {
    return '<a href="' + url + '" target="_blank">' + text + '</a>';
};

exports.AppFooterBar = AppFooterBar;