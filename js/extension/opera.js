'use strict';

var inherit = require('../utils').inherit,
    Chrome = require('./chrome').Chrome;

/**
 * @constructor
 */
var Opera = function (options) {
    Opera.superclass.constructor.call(this, options);
};

inherit(Opera, Chrome);

exports.Opera = Opera;