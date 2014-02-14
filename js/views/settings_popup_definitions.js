'use strict';

var UTILS = require('../utils'),
    inherit = require('../utils').inherit,
    CheckBox = require('../ui/check_box').CheckBox,
    Select = require('../ui/select').Select,
    SettingsBlock = require('./settings_block').SettingsBlock;

/**
 * @constructor
 */
var SettingsPopupDefinitions = function (options) {
    SettingsPopupDefinitions.superclass.constructor.call(this, options);
    this.setTitle(__(3));
};

inherit(SettingsPopupDefinitions, SettingsBlock);

/** @private */
SettingsPopupDefinitions.prototype.createDom = function (state) {
    SettingsPopupDefinitions.superclass.createDom.apply(this, arguments);
    this.$container.addClass('settingsPopupDefinitions');

    this.autoPlay = new CheckBox({label: __(15), checked: state.autoPlay})
        .on('change', function (value) { state.autoPlay = value; })
        .appendTo(this.$content);

    this.showPlayIcon = new CheckBox({ label: __(16), checked: state.showPlayIcon })
        .on('change', function (value) { state.showPlayIcon = value; })
        .appendTo(this.$content);

    this.autoDetection = new CheckBox({label: __(64), title: __(65), checked: state.autoDetection, className: 'autoDetection'})
        .toggle(state.keyAction)
        .on('change', function (value) { state.autoDetection = value; })
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
        .on('keydown', this.onDefineKey.bind(this))
        .appendTo(this.keyAction.$container);
};

SettingsPopupDefinitions.prototype.bindEvents = function () {
    SettingsPopupDefinitions.superclass.bindEvents.apply(this, arguments);
    this.keyAction.on('change', function (checked) {
        this.autoDetection.setValue(checked).toggle(checked);
    }, this);
};

/** @private */
SettingsPopupDefinitions.prototype.onDefineKey = function (e) {
    var keyCode = e.which,
        hotKey = UTILS.getHotkey(e),
        tabKey = keyCode === 9,
        escapeKey = keyCode === 27;

    if (hotKey.length >= 2) {
        hotKey = hotKey.join('+');
        this.state.hotKey = hotKey;
        this.$hotKey.text(hotKey);
    }

    if (escapeKey) this.$hotKey.blur();
    if (!tabKey) e.preventDefault();
};

exports.SettingsPopupDefinitions = SettingsPopupDefinitions;