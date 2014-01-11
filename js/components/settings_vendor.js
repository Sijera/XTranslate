'use strict';

var inherit = require('../utils').inherit,
    Google = require('../vendors/google').Google,
    Bing = require('../vendors/bing').Bing,
    Yandex = require('../vendors/yandex').Yandex,
    Radio = require('../ui/radio').Radio,
    LanguagesPairSelect = require('./languages_pair_select').LanguagesPairSelect,
    SettingsBlock = require('./settings_block').SettingsBlock;

/**
 * @constructor
 */
var SettingsVendor = function (options) {
    this.vendors = {
        'google': new Google({settings: this, isDefault: true}),
        'yandex': new Yandex({settings: this}),
        'bing'  : new Bing({settings: this})
    };

    this.vendorsMap = Object.keys(this.vendors).map(function (name) {
        var vendor = this.getVendorByName(name);
        if (vendor.isDefault) this.defaultVendor = vendor.name;
        return vendor;
    }, this);

    SettingsVendor.superclass.constructor.call(this, options);
    this.setTitle(__(4));
};

inherit(SettingsVendor, SettingsBlock);

/** @private */
SettingsVendor.prototype.createDom = function (state) {
    SettingsVendor.superclass.createDom.apply(this, arguments);
    this.$container.addClass('settingsVendor');

    this.activeVendor = state['activeVendor'] || this.defaultVendor;
    this.fillVendors();
    this.fillLangs();
};

SettingsVendor.prototype.getActiveVendor = function () {
    return this.getVendorByName(this.activeVendor);
};

SettingsVendor.prototype.getVendorByName = function (name) {
    return this.vendors[name];
};

/** @private */
SettingsVendor.prototype.fillLangs = function () {
    if (!this.langPair) {
        /** @type {LanguagesPairSelect} */
        this.langPair = APP.data('langPair', new LanguagesPairSelect({state: this.state['langPair']}));
        this.$langPairHolder = $('<div class="langPairHolder"/>').appendTo(this.$content);
    }
    var vendor = APP.data('vendor', this.getActiveVendor());
    this.langPair.setLangList(vendor.langList);
};

/** @private */
SettingsVendor.prototype.fillVendors = function () {
    this.vendorsMap.forEach(this.addVendor, this);
};

/** @private */
SettingsVendor.prototype.addVendor = function (vendor) {
    var $label = $('<span class="title"/>').text(vendor.title);
    var $url = $('<a class="url" target="_blank"/>')
        .attr('href', vendor.url)
        .text(vendor.url.replace(/^https?:\/\/|\/$/gi, ''))
        .on('click', function (e) { e.stopPropagation() });

    var radio = new Radio({
        className: 'vendor',
        name     : 'vendor',
        value    : vendor.name,
        label    : $label.add($url),
        checked  : this.activeVendor == vendor.name
    }).appendTo(this.$content);

    radio.on('change', this.onVendorChange.bind(this));
    if (!this.vendor) this.vendor = radio;
};

/** @private */
SettingsVendor.prototype.onVendorChange = function (name) {
    this.activeVendor = name;
    this.fillLangs();
    APP.trigger('vendorChange');
};

SettingsVendor.prototype.getState = function () {
    var state = SettingsVendor.superclass.getState.apply(this, arguments);
    return $.extend(state, {
        'activeVendor': this.activeVendor,
        'langPair'    : this.langPair.getState()
    });
};

SettingsVendor.prototype.getLangPair = function () {
    return [this.langPair.langFrom, this.langPair.langTo];
};

exports.SettingsVendor = SettingsVendor;