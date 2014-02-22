'use strict';

var UTILS = require('../utils'),
    inherit = require('../utils').inherit,
    CheckBox = require('../ui/check_box').CheckBox,
    Select = require('../ui/select').Select,
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

    this.autoFocus = new CheckBox({label: __(65), checked: state.autoFocus})
        .on('change', function (value) { state.autoFocus = value; })
        .appendTo(this.$content);

    this.showPlayIcon = new CheckBox({label: __(16), checked: state.showPlayIcon })
        .on('change', function (value) { state.showPlayIcon = value; })
        .appendTo(this.$content);

    this.rememberText = new CheckBox({label: __(67), checked: APP.get('userInputContainer.rememberText') })
        .on('change', function (value) { APP.set('userInputContainer.rememberText', value); })
        .appendTo(this.$content);

    this.selectAction = new CheckBox({label: __(8), checked: state.selectAction, className: 'sep'})
        .on('change', function (value) { state.selectAction = value; })
        .appendTo(this.$content);

    this.clickAction = new CheckBox({label: __(7), checked: state.clickAction})
        .on('change', function (value) { state.clickAction = value; })
        .appendTo(this.$content);

    this.keyAction = new CheckBox({label: __(9), checked: state.keyAction})
        .on('change', function (value) { state.keyAction = value; })
        .appendTo(this.$content);

    this.$hotKey = $('<span class="hotKey" contenteditable="true"/>')
        .text(state.hotKey)
        .attr('title', __(10))
        .on('click', false)
        .on('keydown', this.onDefineKey.bind(this))
        .appendTo(this.keyAction.$label);

    this.$hotKeyHint = $('<i class="hint"> *</i>')
        .attr('title', __(64))
        .appendTo(this.keyAction.$label);
};

/** @private */
SettingsDisplayOptions.prototype.onDefineKey = function (e) {
    var keyCode = e.which,
        hotKey = UTILS.getHotkey(e),
        tabKey = keyCode === 9,
        escapeKey = keyCode === 27,
        enterKey = keyCode === 13;

    if (hotKey.length >= 2) {
        hotKey = hotKey.join('+');
        this.state.hotKey = hotKey;
        this.$hotKey.text(hotKey);
    }

    if (escapeKey || enterKey) this.$hotKey.blur();
    if (!tabKey || enterKey) {
        e.preventDefault();
        e.stopPropagation();
    }
};

exports.SettingsDisplayOptions = SettingsDisplayOptions;