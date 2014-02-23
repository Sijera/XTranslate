'use strict';

var inherit = require('../utils').inherit,
    UIComponent = require('../ui/ui_component').UIComponent;

/**
 * Base class for all blocks in settings list
 * @constructor
 */
var SettingsBlock = function (options) {
    SettingsBlock.superclass.constructor.call(this, options);

    this.createDom(this.state);
    this.bindEvents();
};

inherit(SettingsBlock, UIComponent);

/** @private */
SettingsBlock.prototype.createDom = function (state) {
    this.$container.addClass('settingsBlock');
    this.setCollapsed(state.collapsed);

    this.$icon = $('<i class="iconPlusMinus"/>').attr('title', __(21)).appendTo(this.$container);
    this.$title = $('<div class="title"/>').appendTo(this.$container);
    this.$content = $('<div class="content"/>').appendTo(this.$container);
};

/** @private */
SettingsBlock.prototype.bindEvents = function () {
    this.$icon.on('click', this.onClickShare.bind(this));
};

SettingsBlock.prototype.setCollapsed = function (val) {
    this.state.collapsed = val;
    this.$container.toggleClass('collapsed', val);
};

SettingsBlock.prototype.setTitle = function (title) {
    this.$title.text(title);
};

/** @private */
SettingsBlock.prototype.onClickShare = function () {
    this.setCollapsed(!this.state.collapsed);
};

exports.SettingsBlock = SettingsBlock;