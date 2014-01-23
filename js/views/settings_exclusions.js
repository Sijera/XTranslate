'use strict';

var inherit = require('../utils').inherit,
    SettingsBlock = require('./settings_block').SettingsBlock;

/**
 * @constructor
 */
var SettingsExclusions = function (options) {
    SettingsExclusions.superclass.constructor.call(this, options);
    this.setTitle(__(6));
};

inherit(SettingsExclusions, SettingsBlock);

SettingsExclusions.prototype.createDom = function (state) {
    SettingsExclusions.superclass.createDom.apply(this, arguments);
    this.$container.addClass('settingsExclusions');

    this.$content.append(
        '<p>' + __(18) + '</p>',
        '<p>' + __(19) + '</p>',
        '<p>' + __(20) + '</p>'
    );

    this.$links = $('<textarea/>')
        .on('input', this.onInput.bind(this))
        .on('blur', this.refreshLinks.bind(this))
        .appendTo(this.$content);

    this.refreshLinks();
};

/** @private */
SettingsExclusions.prototype.onInput = function () {
    this.state.links = this.$links.val().trim().split(/\s*\n\s*/).join('|');
};

/** @private */
SettingsExclusions.prototype.refreshLinks = function () {
    this.$links.val(this.state.links.split('|').join('\n').trim());
};

exports.SettingsExclusions = SettingsExclusions;