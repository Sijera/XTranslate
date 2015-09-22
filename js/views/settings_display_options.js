'use strict';

var UTILS = require('../utils'),
    inherit = require('../utils').inherit,
    CheckBox = require('../ui/check_box').CheckBox,
    SettingsBlock = require('./settings_block').SettingsBlock;

/**
 * @constructor
 */
var SettingsDisplayOptions = function (options) {
    SettingsDisplayOptions.superclass.constructor.call(this, options);
    this.setTitle(__(3));
};

inherit(SettingsDisplayOptions, SettingsBlock);

/** @private */
SettingsDisplayOptions.prototype.createDom = function (state) {
    SettingsDisplayOptions.superclass.createDom.apply(this, arguments);
    this.$container.addClass('settingsDisplayOptions');

    this.autoPlay = new CheckBox({label: __(15), checked: state.autoPlay})
        .on('change', function (value) { state.autoPlay = value; })
        .appendTo(this.$content);

    this.onWindowThemeChange(state.whiteTheme);
    this.useWhiteTheme = new CheckBox({label: __(74), checked: state.whiteTheme})
      .on('change', function (value) { state.whiteTheme = value; })
      .on('change', this.onWindowThemeChange.bind(this))
      .appendTo(this.$content);

    this.showPlayIcon = new CheckBox({label: __(16), checked: state.showPlayIcon })
        .on('change', function (value) { state.showPlayIcon = value; })
        .appendTo(this.$content);

    this.spellCheck = new CheckBox({label: __(68), checked: state.spellCheck, className: 'sep'})
        .on('change', function (value) { state.spellCheck = value; })
        .appendTo(this.$content);

    this.contextMenu = new CheckBox({label: __(69), checked: state.contextMenu})
        .on('change', function (value) { state.contextMenu = value; })
        .appendTo(this.$content);

    this.autoFocus = new CheckBox({label: __(65), checked: state.autoFocus})
        .on('change', function (value) { state.autoFocus = value; })
        .appendTo(this.$content);

    this.rememberText = new CheckBox({label: __(67), checked: APP.get('userInputContainer.rememberText') })
        .on('change', function (value) { APP.set('userInputContainer.rememberText', value); })
        .appendTo(this.$content);

    this.showActionIcon = new CheckBox({label: __(72), checked: state.showActionIcon, className: 'sep'})
        .on('change', function (value) { state.showActionIcon = value; })
        .appendTo(this.$content);

    this.selectAction = new CheckBox({label: __(8), checked: state.selectAction})
        .on('change', function (value) { state.selectAction = value; })
        .appendTo(this.$content);

    this.clickAction = new CheckBox({label: __(7), checked: state.clickAction})
        .on('change', function (value) { state.clickAction = value; })
        .appendTo(this.$content);

    this.keyAction = new CheckBox({label: __(9), checked: state.keyAction})
        .on('change', function (value) { state.keyAction = value; })
        .appendTo(this.$content);

    this.$hotKey = $('<span class="hotKey" contenteditable="true"/>')
        .html(state.hotKey)
        .attr('title', __(10))
        .on('click', false)
        .on('keydown', this.onDefineKey.bind(this))
        .appendTo(this.keyAction.$label);

    var ctrlKeysDescription = [
        String.fromCharCode(8984) + ' . . . Command, Cmd, Clover, (formerly) Apple',
        String.fromCharCode(8963) + ' . . . Control, Ctl, Ctrl',
        String.fromCharCode(8997) + ' . . . Option, Opt, (Windows) Alt',
        String.fromCharCode(8679) + ' . . . Shift'
    ];

    this.$hotKeyHint = $('<i class="hint"> *</i>')
        .attr('x-title', [__(64), '--'].concat(ctrlKeysDescription).join('\n'))
        .appendTo(this.keyAction.$label);

    // TODO: make as external component
    this.zoomMin = 50;
    this.zoomMax = 250;
    this.zoomStep = 10;

    this.$fontSizeBase = $('<div class="uiFontSize sep"/>').appendTo(this.$content);
    this.$fontSizeBase.append('<span class="name">' + __(71) + '</span>');
    this.$zoomOut = $('<i class="fa-icon fa-minus-square-o">').appendTo(this.$fontSizeBase);
    this.$zoomValue = $('<span class="zoomValue">').appendTo(this.$fontSizeBase);
    this.$zoomIn = $('<i class="fa-icon fa-plus-square-o">').appendTo(this.$fontSizeBase);

    this.$zoomIn.on('click', this.setZoom.bind(this, +1));
    this.$zoomOut.on('click', this.setZoom.bind(this, -1));
    this.setZoom();
};

/** @private */
SettingsDisplayOptions.prototype.setZoom = function (dir) {
    dir = dir || 0;
    var zoomValNew = this.state.zoomValue + this.zoomStep * dir;
    if (zoomValNew < this.zoomMin || this.zoomMax < zoomValNew) return;
    this.$zoomOut.toggleClass('disabled', zoomValNew === this.zoomMin);
    this.$zoomIn.toggleClass('disabled', zoomValNew === this.zoomMax);
    this.state.zoomValue = zoomValNew;
    this.$zoomValue.text(zoomValNew + '%');
    APP.view.$container.css('fontSize', zoomValNew + '%');
};

/** @private */
SettingsDisplayOptions.prototype.onDefineKey = function (e) {
    var keyCode = e.which,
        hotKey = UTILS.getHotkey(e),
        tabKey = keyCode === 9,
        escapeKey = keyCode === 27,
        enterKey = keyCode === 13;

    if (hotKey) {
        this.state.hotKey = hotKey;
        this.$hotKey.html(hotKey);
    }

    if (escapeKey || enterKey) this.$hotKey.blur();
    if (!tabKey || enterKey) {
        e.preventDefault();
        e.stopPropagation();
    }
};

/** @private */
SettingsDisplayOptions.prototype.onWindowThemeChange = function (use) {
    var $themeCssLink = $('link.theme');
    $themeCssLink.attr('href', use ? $themeCssLink.data('href') : '');
};

exports.SettingsDisplayOptions = SettingsDisplayOptions;