'use strict';

var inherit = require('../utils').inherit,
    EventDriven = require('../events').EventDriven;

/**
 * Base class for all translation vendors
 * @constructor
 */
var Vendor = function (options) {
    Vendor.superclass.constructor.call(this, options = options || {});

    /** @type {SettingsVendor} */ this.settings = options.settings;
    /** @type {Boolean} */ this.isDefault = !!options.isDefault;

    this.name = '';         // code name
    this.title = '';        // title to use in the select box
    this.url = '';          // base url of translation service
    this.langList = {};     // list of supported languages in format {iso:title, ...}
    this.data = undefined;  // last parsed data from received translation request
    this.tts = true;       // playing text to speech ability
};

inherit(Vendor, EventDriven);

Vendor.prototype.getLangPair = function () {
    return this.settings.getLangPair();
};

Vendor.prototype.getData = function () {
    return this.data;
};

exports.Vendor = Vendor;