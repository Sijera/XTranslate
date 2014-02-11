'use strict';

var UTILS = require('../utils'),
    inherit = require('../utils').inherit,
    CheckBox = require('../ui/check_box').CheckBox,
    TextInput = require('../ui/text_input').TextInput,
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

    this.clickAction = new CheckBox({label: __(7), checked: state.clickAction, className: 'sep'})
        .on('change', function (value) { state.clickAction = value; })
        .appendTo(this.$content);

    this.selectAction = new CheckBox({label: __(8), checked: state.selectAction})
        .on('change', function (value) { state.selectAction = value; })
        .appendTo(this.$content);

    this.keyAction = new CheckBox({label: __(9), checked: state.keyAction})
        .on('change', function (value) { state.keyAction = value; })
        .appendTo(this.$content);

    this.hotKey = new TextInput({className: 'hotKey', value: state.hotKey})
        .on('change', function (value) { state.hotKey = value; })
        .appendTo(this.$content);

    this.hotKey.$container.attr('title', __(10));
    this.hotKey.toggle(this.keyAction.getValue());
};

/** @private */
SettingsPopupDefinitions.prototype.bindEvents = function () {
    SettingsPopupDefinitions.superclass.bindEvents.apply(this, arguments);

    this.keyAction.on('change', this.hotKey.toggle.bind(this.hotKey));
    this.hotKey.on('keydown', this.onDefineKey.bind(this));
};

/** @private */
SettingsPopupDefinitions.prototype.onDefineKey = function (e) {
    var keyCode = e.which,
        hotKey = UTILS.getHotkey(e),
        tabKey = keyCode === 9,
        escapeKey = keyCode === 27;

    if (hotKey.length >= 2) this.hotKey.setValue(hotKey.join('+'), true);
    if (!tabKey && !escapeKey) e.preventDefault();
};

exports.SettingsPopupDefinitions = SettingsPopupDefinitions;