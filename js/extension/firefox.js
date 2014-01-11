'use strict';

var inherit = require('../utils').inherit,
    Extension = require('./extension').Extension;

/**
 * @constructor
 */
var Firefox = function (options) {
    Firefox.superclass.constructor.call(this, options);
};

inherit(Firefox, Extension);

exports.Firefox = Firefox;