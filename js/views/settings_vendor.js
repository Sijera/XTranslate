'use strict';

var inherit = require('../utils').inherit,
    Radio = require('../ui/radio').Radio,
    VendorLanguageSelect = require('./vendor_language_select').VendorLanguageSelect,
    SettingsBlock = require('./settings_block').SettingsBlock;

/**
 * @constructor
 */
var SettingsVendor = function (options) {
    SettingsVendor.superclass.constructor.call(this, options);
    this.setTitle(__(4));
};

inherit(SettingsVendor, SettingsBlock);

/** @private */
SettingsVendor.prototype.createDom = function (state) {
    SettingsVendor.superclass.createDom.apply(this, arguments);
    this.$container.addClass('settingsVendor');

    Object.keys(APP.vendors).forEach(function (name) {
        this.addVendor(APP.vendors[name]);
    }, this);

    this.selectLang = new VendorLanguageSelect().appendTo(this.$content);
};

/**
 * @private
 * @param {Vendor|Google|Yandex|Bing} vendor
 */
SettingsVendor.prototype.addVendor = function (vendor) {
    var $label = $('<span class="title"/>').text(vendor.title);
    var $url = $('<a class="url" target="_blank" tabIndex="-1"/>')
        .attr('href', vendor.url)
        .text(vendor.url.replace(/^https?:\/\/|\/$/gi, ''))
        .on('click', function (e) { e.stopPropagation() });

    var radio = new Radio({
        className: 'vendor',
        name     : 'vendor',
        label    : $label.add($url),
        value    : vendor.name,
        checked  : vendor.name === this.state.activeVendor
    }).appendTo(this.$content);

    radio.on('change', this.onVendorChange.bind(this));
};

/** @private */
SettingsVendor.prototype.onVendorChange = function (name) {
    this.state.activeVendor = name;
};

exports.SettingsVendor = SettingsVendor;