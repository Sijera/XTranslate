'use strict';

var UTILS = require('../utils'),
    inherit = require('../utils').inherit,
    FlyingPanel = require('./flying_panel').FlyingPanel,
    FormControl = require('./form_control').FormControl;

/** @const */ var IS_FOCUSED = 'focused';
/** @const */ var IS_ACTIVATED = 'activated';

/**
 * Text input form control
 * @constructor
 * @param {{name, inputType, inputPattern, placeholder, maxLength, readonly, tooltip, value, restoreOnBlur, validation}} options
 */
var TextInput = function (options) {
    TextInput.superclass.constructor.call(this, options = options || {});

    this._value = this.lastValidValue = "";
    this.inputted = false;
    this.valid = true;
    this.validators = [];
    this.restoreOnBlur = !!options.restoreOnBlur;
    this.noBodyAppend = options.noBodyAppend !== false;
    this.listBorderElem = options.listBorderElem;

    this.createDom(options);
    this.setTooltip(options.tooltip);
    this.setValue(options.value);
    this.setTitle(options.title);
    this.addValidator(options.validation);
    this.bindEvents();

    Object.defineProperties(this, {
        value: {get: this.getValue, set: this.setValue}
    });
};

inherit(TextInput, FormControl);

/** @private */
TextInput.prototype.createDom = function (options) {
    this.$container.addClass('textInput');

    this.$input = $('<input class="editBox" autocomplete="on"/>').attr({
        name       : options.name,
        type       : options.inputType || 'text',
        pattern    : options.inputPattern,
        placeholder: options.placeholder,
        maxLength  : options.maxLength,
        readonly   : options.readonly,
        tabIndex   : options.readonly ? -1 : undefined
    }).appendTo(this.$container);
};

/** @private */
TextInput.prototype.bindEvents = function () {
    this.$input
        .on('input', this._onInput.bind(this))
        .on('focus', this._onFocus.bind(this))
        .on('blur', this._onBlur.bind(this))
        .on('keydown', this._onKeyDown.bind(this));
};

TextInput.prototype.getValue = function () {
    return this._value;
};

TextInput.prototype.setValue = function (value, emitChange, isTyping) {
    if (value === undefined) return;
    this._value = value;
    if (!isTyping) this.setInputValue(value);
    var valid = this._checkValue(value);
    if (valid) {
        var prev = this.lastValidValue;
        if (emitChange) this.trigger('change', value, prev);
        this.lastValidValue = value;
    }
};

TextInput.prototype.parseValue = function (value) {
    if (value === undefined) value = this.getInputValue();
    return {value: value};
};

TextInput.prototype.setInputValue = function (value) {
    this.$input.val(value);
};

TextInput.prototype.getInputValue = function () {
    return this.$input.val();
};

/**
 * @param {Function|RegExp|Object} validator
 * @param {Object} [context]
 * @param {String|jQuery|HTMLElement|*} [tooltip] Error message will be used if the validator fall
 * @param {Array} [tooltipData] A list of params for formatting tooltip on the fly
 */
TextInput.prototype.addValidator = function (validator, context, tooltip, tooltipData) {
    if (!validator) return null;
    var validObj = {
        source     : validator,
        context    : context,
        tooltip    : tooltip,
        tooltipData: tooltipData,
        inverse    : false
    };

    if ($.isPlainObject(validator)) {
        $.extend(validObj, validator);
        validator = validObj.source;
        context = validObj.context;
    }

    validObj.validator = validator instanceof RegExp ? validator.test.bind(validator) : validator.bind(context);
    this.validators.push(validObj);
    return validObj;
};

/**
 * @param {Object|Function|RegExp} validator The object returned from TextInput.addValidator() or source object of validator
 */
TextInput.prototype.removeValidator = function (validator) {
    var validators = this.validators;
    if ($.isPlainObject(validator)) {
        var index = validators.indexOf(validator);
        if (index > -1) validators.splice(index, 1);
    }
    else {
        var found = validators.filter(function (o) { return o.source == validator });
        while ((index = validators.indexOf(found.shift())) > -1) validators.splice(index, 1);
    }
};

/** @private */
TextInput.prototype._onKeyDown = function (e) {
    var keyCode = e.which;
    if (keyCode == 27) this.$input.blur();
    if (keyCode == 13) this.trigger('keyenter', e);
    this.trigger('keydown', e);
    e.stopPropagation();
};

/** @private */
TextInput.prototype._onInput = function () {
    this.inputted = true;
    var value = this.parseValue().value;
    this.setValue(value, true, true);
    this.trigger('input', value, this.valid);
};

/** @private */
TextInput.prototype._onFocus = function () {
    this.focused = true;
    this.$container.addClass(IS_ACTIVATED).addClass(IS_FOCUSED);
    this.hideTooltip();
    this.trigger('focus');
};

/** @private */
TextInput.prototype._onBlur = function () {
    this.focused = false;
    this.$container.removeClass(IS_FOCUSED);

    if (this.inputted) this._checkValue(this.value);
    if (this.restoreOnBlur) this.restoreLastValidValue();

    if (!this.valid && this.inputted) {
        this.trigger('error');
        this._repaintErrorState_();
    }

    this.trigger('blur');
};

/** @private */
TextInput.prototype._checkValue = function (value, silent) {
    value = value != null ? value : this.getInputValue();
    var valid = true;

    for (var i = 0; i < this.validators.length; i++) {
        var validObj = this.validators[i];
        valid = validObj.validator(value, validObj, this);

        if (validObj.inverse) valid = !valid;
        if (!valid) {
            var tooltip = validObj.tooltip ? validObj.tooltip : this.tooltipDefault;
            if (validObj.tooltipData) tooltip = UTILS.sprintf.apply(this, [tooltip].concat(validObj.tooltipData));
            this.setTooltip(tooltip);
            break;
        }
    }

    if (!silent) this.valid = valid;
    else this._valid_ = valid;

    return valid;
};

/** @private */
TextInput.prototype.restoreLastValidValue = function () {
    if (!this.valid) this.setValue(this.lastValidValue);
    else this.setInputValue(this.value);
};

/** @private */
TextInput.prototype._repaintErrorState_ = function (forced, valid) {
    if (!this.inputted && !forced) return;
    if (valid === undefined) valid = this.valid;

    this.$container
        .toggleClass('valid', valid)
        .add(this.$input)
        .add(this.$tooltip)
        .toggleClass('error', !valid);

    if (valid) this.hideTooltip();
    else this.showTooltip();
};

/** @private */
TextInput.prototype._repaintEnabledState_ = function () {
    TextInput.superclass._repaintEnabledState_.call(this);
    this.$input.attr('disabled', !this.enabled);
};

/**
 * @param {String|jQuery|HTMLElement|*} tooltip
 */
TextInput.prototype.setTooltip = function (tooltip) {
    if (tooltip === undefined) return;
    if (!this.tooltip) {
        this.tooltipDefault = tooltip;
        this.tooltip = new FlyingPanel({
            className   : 'tooltip',
            anchor      : this.$container,
            borderElem  : this.listBorderElem,
            noBodyAppend: this.noBodyAppend
        });
        this.$tooltip = this.tooltip.$container;
        this.trigger('tooltipReady');
    }

    this.$tooltip.html(tooltip);
};

/** @private */
TextInput.prototype.showTooltip = function () {
    if (!this.$tooltip || !this.inputted || this.valid) return;
    this.tooltip.show();
};

/** @private */
TextInput.prototype.hideTooltip = function () {
    if (!this.$tooltip) return;
    this.tooltip.hide();
};

TextInput.prototype.enable = function () {
    TextInput.superclass.enable.call(this);
    this._repaintErrorState_();
    return this;
};

TextInput.prototype.disable = function () {
    TextInput.superclass.disable.call(this);
    this._repaintErrorState_(true, true);
    return this;
};

exports.TextInput = TextInput;
