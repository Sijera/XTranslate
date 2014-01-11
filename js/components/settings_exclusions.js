'use strict';

var inherit = require('../utils').inherit,
    SettingsBlock = require('./settings_block').SettingsBlock;

/**
 * @constructor
 */
var SettingsExclusions = function (options) {
    this.defaultLinks = ['acid3.acidtests.org'];

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

    this.links = state['links'] || this.defaultLinks;
    this.refreshLinks();
};

/** @private */
SettingsExclusions.prototype.refreshLinks = function () {
    this.$links.val(this.links.join('\n'));
};

/** @private */
SettingsExclusions.prototype.onInput = function () {
    var value = this.$links.val().trim();
    this.links = value ? value.split(/\s*\n\s*/) : [];
};

SettingsExclusions.prototype.getState = function () {
    var state = SettingsExclusions.superclass.getState.apply(this, arguments);
    return $.extend(state, {
        'links': this.links
    });
};

exports.SettingsExclusions = SettingsExclusions;