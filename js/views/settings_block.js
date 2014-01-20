'use strict';

var inherit = require('../utils').inherit,
    UIComponent = require('../ui/ui_component').UIComponent;

/**
 * Base class for all blocks in settings list
 * @constructor
 */
var SettingsBlock = function (options) {
    options = options || {};
    SettingsBlock.superclass.constructor.call(this, options);

    this.createDom(this.state);
    this.bindEvents();

    var collapsed = this.state['collapsed'];
    this.setCollapsed(collapsed !== undefined ? collapsed : !!options.collapsed);
};

inherit(SettingsBlock, UIComponent);

/** @private */
SettingsBlock.prototype.createDom = function (state) {
    this.$container.addClass('settingsBlock');

    /** @type {jQuery} */ this.$icon = $('<i class="iconPlusMinus"/>').attr('title', __(21)).appendTo(this.$container);
    /** @type {jQuery} */ this.$title = $('<div class="title"/>').appendTo(this.$container);
    /** @type {jQuery} */ this.$content = $('<div class="content"/>').appendTo(this.$container);
};

/** @private */
SettingsBlock.prototype.bindEvents = function () {
    this.$icon.on('click', this.onIconClick.bind(this));
};

SettingsBlock.prototype.setCollapsed = function (boolValue) {
    if (this.collapsed == boolValue) return;
    this.collapsed = boolValue;
    this.$container.toggleClass('collapsed', boolValue);
};

SettingsBlock.prototype.setTitle = function (title) {
    this.$title.text(title);
};

/** @private */
SettingsBlock.prototype.onIconClick = function () {
    this.setCollapsed(!this.collapsed);
};

SettingsBlock.prototype.getState = function () {
    return {
        'collapsed': this.collapsed
    };
};

exports.SettingsBlock = SettingsBlock;