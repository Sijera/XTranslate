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

Opera.prototype.playAudio = function (src) {
    this.stopAudio();
    this.audio = document.createElement('object');
    this.audio.width = 0;
    this.audio.height = 0;
    this.audio.data = src;
    this.audio.type = 'audio/mpeg';
    document.body.appendChild(this.audio);
};

Opera.prototype.stopAudio = function () {
    if (!this.audio) return;
    document.body.removeChild(this.audio);
    delete this.audio;
};

exports.Opera = Opera;