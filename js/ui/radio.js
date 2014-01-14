'use strict';

var inherit = require('../utils').inherit,
    FormControl = require('./form_control').FormControl;

/**
 * @constructor
 */
var Radio = function (options) {
    Radio.superclass.constructor.apply(this, arguments);
    options = options || {};

    this.name = options.name || 'radioBtn_'+ (Radio.COUNTER++);
    this.group = Radio.GROUPS[this.name] || (Radio.GROUPS[this.name] = []);
    this.label = options.label || '';
    this.title = options.title || '';
    this.value = options.value !== undefined ? options.value : '';

    this.$container.addClass('radio').on('keydown', this.onKeyDown.bind(this));
    this.$input = $('<input type="radio">').hide().val(this.value).attr('name', this.name).appendTo(this.$container);

    this.$radio = $('<i class="box"/>')
        .attr('tabIndex', options.tabIndex || 0)
        .on('click', this.check.bind(this, false))
        .appendTo(this.$container);

    if (this.title) this.$container.attr('title', this.title);
    if (this.label) {
        this.$label = $('<span class="label"/>')
            .on('click', this.check.bind(this, false))
            .append(this.label)
            .appendTo(this.$container);
    }

    this.setChecked(!!options.checked);
    this.group.push(this);
};

inherit(Radio, FormControl);

Radio.COUNTER = 0;
Radio.GROUPS = {};

Radio.prototype.setChecked = function (val, silent) {
    if (this.checked === val) return;
    this.checked = (val = !!val);
    this.$input.prop('checked', val);
    this.$radio.toggleClass('checked', val);
    if (!silent) this.trigger('change', this.value);
};

Radio.prototype.check = function (silent) {
    if (this.checked) return;
    this.group.forEach(function (radio) {
        if (radio !== this) radio.unCheck(true);
    }, this);
    this.setChecked(true, silent);
};

Radio.prototype.unCheck = function (silent) {
    if (!this.checked) return;
    this.setChecked(false, silent);
};

Radio.prototype.setValue = function (value, silent) {
    for (var i = 0; i < this.group.length; i++) {
        var radio = this.group[i];
        if (radio.value === value) {
            radio.check(silent);
            break;
        }
    }
};

Radio.prototype.getValue = function () {
    var value;
    for (var i = 0; i < this.group.length; i++) {
        var radio = this.group[i];
        if (radio.checked) {
            value = radio.value;
            break;
        }
    }
    return value;
};

/** @private */
Radio.prototype.onKeyDown = function (e) {
    var keyCode = e.which;
    if (keyCode == 13 || keyCode == 32) {
        this.check();
        e.preventDefault();
    }
};

exports.Radio = Radio;