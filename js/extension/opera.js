'use strict';

var inherit = require('../utils').inherit,
    Extension = require('./extension').Extension;

/**
 * @constructor
 */
var Opera = function (options) {
    Opera.superclass.constructor.call(this, options);
};

inherit(Opera, Extension);

exports.Opera = Opera;