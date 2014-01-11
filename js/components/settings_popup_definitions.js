'use strict';

var inherit = require('../utils').inherit,
    isControlKey = require('../utils').isControlKey,
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
    this.savePlayIconState();
};

inherit(SettingsPopupDefinitions, SettingsBlock);

/** @private */
SettingsPopupDefinitions.prototype.createDom = function (state) {
    SettingsPopupDefinitions.superclass.createDom.apply(this, arguments);
    this.$container.addClass('settingsPopupDefinitions');

    this.autoPlay = new CheckBox({label: __(15), checked: state['autoPlay']}).appendTo(this.$content);
    this.showPlayIcon = new CheckBox({label: __(16), checked: state['showPlayIcon'] !== false}).appendTo(this.$content);
    this.showOnToolbar = new CheckBox({label: __(17), checked: state['showOnToolbar'] !== false}).appendTo(this.$content);

    this.clickAction = new CheckBox({label: __(7), checked: state['clickAction'] !== false, className: 'sep'}).appendTo(this.$content);
    this.selectAction = new CheckBox({label: __(8), checked: state['selectAction']}).appendTo(this.$content);
    this.keyAction = new CheckBox({label: __(9), checked: state['keyAction'] !== false}).appendTo(this.$content);

    this.hotKey = new TextInput({className: 'hotKey', value: state['hotKey'] || 'Ctrl+Shift+X'}).appendTo(this.$content);
    this.hotKey.$container.attr('title', __(10));
};

/** @private */
SettingsPopupDefinitions.prototype.bindEvents = function () {
    SettingsPopupDefinitions.superclass.bindEvents.apply(this, arguments);

    this.keyAction.on('change', this.hotKey.toggle.bind(this.hotKey));
    this.hotKey.on('keydown', this.onDefineHotkey, this);
    this.showPlayIcon.on('change', this.onPlayIconChange, this);
};

SettingsPopupDefinitions.prototype.onPlayIconChange = function (state) {
    this.savePlayIconState();
    APP.trigger('playIconToggle');
};

/** @private */
SettingsPopupDefinitions.prototype.savePlayIconState = function () {
    APP.data('useTextToSpeech', this.showPlayIcon.getValue());
};

/** @private */
SettingsPopupDefinitions.prototype.onDefineHotkey = function (e) {
    var keyCode = e.which,
        char = String.fromCharCode(keyCode),
        ctrlKey = isControlKey(e),
        tabKey = keyCode === 9,
        escapeKey = keyCode === 27,
        shiftKey = e.shiftKey,
        altKey = e.altKey;

    if (char.match(/[A-Z0-9]/) && (ctrlKey || shiftKey || altKey)) {
        var hotKey = [];
        ctrlKey && hotKey.push('Ctrl');
        shiftKey && hotKey.push('Shift');
        altKey && hotKey.push('Alt');
        hotKey.push(char);
        this.hotKey.value = hotKey.join('+');
    }

    if (!tabKey && !escapeKey) e.preventDefault();
};

SettingsPopupDefinitions.prototype.getState = function () {
    var state = SettingsPopupDefinitions.superclass.getState.apply(this, arguments);
    return $.extend(state, {
        'autoPlay'     : this.autoPlay.getValue(),
        'showPlayIcon' : this.showPlayIcon.getValue(),
        'showOnToolbar': this.showOnToolbar.getValue(),
        'clickAction'  : this.clickAction.getValue(),
        'selectAction' : this.selectAction.getValue(),
        'keyAction'    : this.keyAction.getValue(),
        'hotKey'       : this.hotKey.getValue()
    });
};

exports.SettingsPopupDefinitions = SettingsPopupDefinitions;