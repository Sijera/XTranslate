'use strict';

var inherit = require('../utils').inherit,
    TextInput = require('./text_input').TextInput,
    jQueryMouseWheel = require('../libs/jquery-mousewheel');

/** @const */ var TIMER_DELAY = 500;
/** @const */ var TIMER_SPEED = 30;
/** @const */ var ARROW_ACTIVE = 'active';

/**
 * Numeric input form control with increase/decrease (+/-) buttons
 * @constructor
 */
var NumberInput = function (options) {
    if (!options) options = {};
    options = $.extend({value: options.minValue, restoreOnBlur: true}, options);

    /** @type {Number} */  this.step = options.step || Math.pow(10, -options.digits || 0);
    /** @type {Number} */  this.digits = this.getDigitsAfterDot(this.step);
    /** @type {Number} */  this.minValue = options.minValue !== undefined ? options.minValue : -Infinity;
    /** @type {Number} */  this.maxValue = options.maxValue !== undefined ? options.maxValue : Infinity;

    NumberInput.superclass.constructor.call(this, options);

    this.inputted = true;
    this.increase = this.setValueByStep.bind(this, +1);
    this.decrease = this.setValueByStep.bind(this, -1);

    this.addValidator(this.numberValidator.bind(this));
};

inherit(NumberInput, TextInput);

/** @private */
NumberInput.prototype.createDom = function () {
    NumberInput.superclass.createDom.apply(this, arguments);

    this.$container.addClass('numberInput');
    this.$upArr   = $('<span class="upArr"/>').appendTo(this.$container);
    this.$downArr = $('<span class="downArr"/>').appendTo(this.$container);
};

/** @private */
NumberInput.prototype.bindEvents = function () {
    NumberInput.superclass.bindEvents.apply(this, arguments);

    var touchDevice = 'ontouchstart' in window;
    var mouseDown = touchDevice ? 'touchstart' : 'mousedown';
    var mouseUp = touchDevice ? 'touchend' : 'mouseleave mouseup';

    this.$upArr.on(mouseDown, this._onArrowUp.bind(this));
    this.$downArr.on(mouseDown, this._onArrowDown.bind(this));
    this.$container.on(mouseUp, this.stop.bind(this));

    if (!touchDevice) {
        this.$container.on('mousewheel', this.onScroll.bind(this));
        this.$input
            .on('keydown', this._onKeyDown.bind(this))
            .on('keyup', this._onKeyUp.bind(this));
    }
};

/** @private */
NumberInput.prototype.numberValidator = function (value) {
    value = Number(value);
    if (isNaN(value)) return false;
    var validDecimals = this.digits === 0 ? (value === (0 | value)) : true;
    var inRange = value >= this.minValue && value <= this.maxValue;
    return validDecimals && inRange;
};

NumberInput.prototype.getValue = function () {
    var value = NumberInput.superclass.getValue.call(this);
    return +Number(value).toFixed(this.digits);
};

/** @private */
NumberInput.prototype.setInputValue = function (value) {
    value = Number(value).toFixed(this.digits);
    NumberInput.superclass.setInputValue.call(this, value);
};

/** @private */
NumberInput.prototype._onArrowUp = function (e) {
    this.$upArr.addClass(ARROW_ACTIVE);
    this.start(this.increase);
    e.preventDefault();
};

/** @private */
NumberInput.prototype._onArrowDown = function (e) {
    this.$downArr.addClass(ARROW_ACTIVE);
    this.start(this.decrease);
    e.preventDefault();
};

/** @private */
NumberInput.prototype._onKeyDown = function (e) {
    NumberInput.superclass._onKeyDown.apply(this, arguments);

    if (this.delayTimer !== undefined) {
        e.preventDefault();
        return;
    }
    var keyCode = e.which;
    if (keyCode === 38) this._onArrowUp(e);
    if (keyCode === 40) this._onArrowDown(e);
};

/** @private */
NumberInput.prototype._onKeyUp = function () {
    if (this.delayTimer === undefined) return;
    this.stop();
};

/** @private */
NumberInput.prototype.start = function (callback) {
    callback();
    this.delayTimer = setTimeout(function () {
        this.repeatTimer = setInterval(callback, TIMER_SPEED);
    }.bind(this), TIMER_DELAY);
};

/** @private */
NumberInput.prototype.stop = function () {
    this.$downArr.removeClass(ARROW_ACTIVE);
    this.$upArr.removeClass(ARROW_ACTIVE);
    clearTimeout(this.repeatTimer);
    clearTimeout(this.delayTimer);
    delete this.repeatTimer;
    delete this.delayTimer;
};

/**
 * @param {Number} dir +1 to increase value or -1 to decrease
 */
NumberInput.prototype.setValueByStep = function (dir) {
    dir = dir / Math.abs(dir);

    var value = !isNaN(this.value) ? this.value : this.lastValidValue;
    value = Number(value) + this.step * dir;
    if (value < this.minValue) value = this.minValue;
    if (value > this.maxValue) value = this.maxValue;
    if (this.value !== value) this.setValue(value, true, false);
};

/** @private */
NumberInput.prototype.onScroll = function (e) {
    if (e.wheelDelta > 0) this.increase();
    if (e.wheelDelta < 0) this.decrease();
    e.preventDefault();
    e.stopPropagation();
};

/** @private */
NumberInput.prototype.getDigitsAfterDot = function (number) {
    number = number || 0;
    return (String(number).split('.')[1] || '').length;
};

exports.NumberInput = NumberInput;
