'use strict';

var inherit = require('../utils').inherit,
    EventDriven = require('../events').EventDriven;

/**
 * Base class for all translation services
 * @constructor
 */
var Vendor = function (options) {
    Vendor.superclass.constructor.call(this, options);

    this.autoDetect = 'auto';
    this.textToSpeech = true;
};

inherit(Vendor, EventDriven);

exports.Vendor = Vendor;