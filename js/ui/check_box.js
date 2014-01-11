'use strict';

var inherit = require('../utils').inherit,
    FormControl = require('./form_control').FormControl;

/**
 * @constructor
 */
var CheckBox = function (options) {
    CheckBox.superclass.constructor.call(this, options = options || {});

    this.$container.addClass('checkBox').attr('tabIndex', options.tabIndex || 0);
    this.$container.on('keydown', this.onKeyDown.bind(this));
    this.$checkbox = $('<span class="box"/>').on('click', this.toggle.bind(this)).appendTo(this.$container);
    this.$input = $('<input type="hidden">').attr('name', options.name).appendTo(this.$container);
    this.value = options.value;

    this.setLabel(options.label);
    this.setTitle(options.title);
    this.setValue(!!options.checked, true);
};

inherit(CheckBox, FormControl);

CheckBox.prototype.toggle = function () {
    if (!this.enabled) return;
    if (this.checked) {
        this.unCheck();
    } else {
        this.check();
    }
};

CheckBox.prototype.setValue = function (value, silent) {
    value = !!value;
    if (!this.enabled || this.checked == value) return this;
    this.checked = value;
    this.$input.val(this.getValue());
    this.$checkbox.toggleClass('checked', value);
    if (!silent) this.trigger('change', value);
    return this;
};

CheckBox.prototype.getValue = function () {
    if (this.value !== undefined) return this.checked ? this.value : null;
    return this.checked;
};

/**
 * Creates a label if not exists and set new content
 * @param {jQuery|String|*} label
 */
CheckBox.prototype.setLabel = function (label) {
    if (!label) return;

    if (!this.$label) {
        if (label instanceof jQuery) this.$label = label;
        else this.$label = $('<span class="label"/>').appendTo(this.$container);
        this.$label.on('click', this.toggle.bind(this));
    }

    if (this.$label !== label) this.$label.html(label);
};

CheckBox.prototype.check = function (silent) {
    return this.setValue(true, silent);
};

CheckBox.prototype.unCheck = function (silent) {
    return this.setValue(false, silent);
};

/** @private */
CheckBox.prototype.onKeyDown = function (e) {
    var keyCode = e.which;
    if (keyCode == 13 || keyCode == 32) {
        this.toggle();
        e.preventDefault();
    }
};

exports.CheckBox = CheckBox;
