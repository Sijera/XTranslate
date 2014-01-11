"use strict";

var UTILS = require('../utils'),
    inherit = UTILS.inherit,
    DragAndDrop = require('./drag_and_drop').DragAndDrop,
    FormControl = require('./form_control').FormControl;

/**
 * Slider (range) form control
 * @constructor
 * @param {{value: (Number|Array), min: Number, max: Number, step: Number, suffix: String, $parent: jQuery}} options
 */
var Slider = function (options) {
    Slider.superclass.constructor.call(this, options = options || {});

    /** @type {Number} */ this.min = options.min !== undefined ? options.min : 0;
    /** @type {Number} */ this.max = options.max !== undefined ? options.max : 100;
    /** @type {Number} */ this.range = this.max - this.min;
    /** @type {Number} */ this.step = options.step || Math.round(this.range / 100);
    /** @type {String} */ this.suffix = options.suffix || '';
    /** @type {Number} */ this.digits = this.getDigitsAfterDot(this.step);

    this.createDom();
    this.bindEvents();
    this.setValue(options.value, true);
};

inherit(Slider, FormControl);

Object.defineProperties(Slider.prototype, {
    low: {
        get: function () {
            return this._low;
        },
        set: function (val) {
            var prev = this._low;
            if(val == prev) return;
            this._low = val;
            this._refreshLow();
            this.trigger('change:low', this._getActualValue(val), this._getActualValue(prev));
        }
    },
    high: {
        get: function () {
            return this._high;
        },
        set: function (val) {
            var prev = this._high;
            if(val == prev) return;
            this._high = val;
            this._refreshHigh();
            this.trigger('change:high', this._getActualValue(val), this._getActualValue(prev));
        }
    }
});

Slider.prototype.createDom = function () {
    this.$container.addClass('slider');
    this.$line = $('<div class="line"/>').appendTo(this.$container);
    this.$input = $('<input type="hidden">').attr('name', this.name).appendTo(this.$container);

    this.$low = $('<span class="value low"><i class="point"/><i class="title"/></span>').appendTo(this.$line);
    this.$lowTitle = this.$line.find('.low .title');
    this.$lowPoint = this.$line.find('.low .point').data('point', 'low');

    this.$high = $('<span class="value high"><i class="point"/><i class="title"/></span>').appendTo(this.$line);
    this.$highTitle = this.$line.find('.high .title');
    this.$highPoint = this.$line.find('.high .point').data('point', 'high');

    this.$high.add(this.$low).attr('tabIndex', 0);
};

Slider.prototype.bindEvents = function () {
    this.dnd = new DragAndDrop();
    this.dnd.addDragObj(this.$highPoint.add(this.$lowPoint));
    this.dnd
        .on('drag:start', this._onDragStart.bind(this))
        .on('drag:change', this._onDragChange.bind(this))
        .on('drag:end', this._onDragEnd.bind(this));

    this.$container
        .on('click', this._onClick.bind(this))
        .on('mousewheel', this._onMouseWheel.bind(this));

    this.$high.add(this.$low)
        .on('focus', this._onPointFocus.bind(this))
        .on('keydown', this._onPointKeyDown.bind(this));
};

Slider.prototype._onDragStart = function (e) {
    this.$container.add(this.$activePoint).addClass(DragAndDrop.DRAG_IN_PROCESS_CLASS);

    this._initHighValue = this.high;
    this._initLowValue = this.low;
    this._useCacheWidth = true;

    delete this._width;
};

Slider.prototype._onDragEnd = function (e) {
    this.$container.add(this.$activePoint).removeClass(DragAndDrop.DRAG_IN_PROCESS_CLASS);
    this._useCacheWidth = false;
};

Slider.prototype._onDragChange = function (e) {
    var offsetX = this._toPoints(e.offsetX);
    if (this.$activePoint == this.$high) this.setHigh(this._initHighValue + offsetX);
    if (this.$activePoint == this.$low) this.setLow(this._initLowValue + offsetX);
    this._valueCorrection();
};

Slider.prototype._valueCorrection = function () {
    this._low = this._getActualValue(this._low);
    this._high = this._getActualValue(this._high);
    this._refreshLine();
};

Slider.prototype._onPointKeyDown = function (e) {
    var keyCode = e.which,
        step = this.step,
        isLowPoint = this.$activePoint == this.$low,
        oldValue = isLowPoint ? this.low : this.high,
        value = oldValue;

    if (e.shiftKey) step *= 10;
    if (e.ctrlKey) step *= 10;

    switch (keyCode) {
        case 35:
            value = this.min;
            break; // END
        case 36:
            value = this.max;
            break; // HOME
        case 37:
            value -= step;
            break; // ARROW LEFT
        case 38:
            value += step;
            break; // ARROW TOP
        case 39:
            value += step;
            break; // ARROW RIGHT
        case 40:
            value -= step;
            break; // ARROW DOWN
    }

    if (value != oldValue) {
        if (isLowPoint) this.setLow(value);
        else this.setHigh(value);
        e.stopPropagation();
        e.preventDefault();
    }
};

Slider.prototype._onPointFocus = function (e) {
    this.$high.add(this.$low).css('z-index', 0);
    this.$activePoint = e.target == this.$low[0] ? this.$low : this.$high;
    this.$activePoint.css('z-index', 1);
};

Slider.prototype._onMouseWheel = function (e) {
    var direction = e.wheelDelta;

    if (!this.$activePoint) this.$activePoint = this.$high;
    if (this.$activePoint == this.$low) this.setLow(this.low + this.step * direction);
    if (this.$activePoint == this.$high) this.setHigh(this.high + this.step * direction);

    this.$activePoint.focus();
    e.stopPropagation();
    e.preventDefault();
};

Slider.prototype._onClick = function (e) {
    var target = e.target;
    if (target == this.$container[0] || target == this.$line[0]) {
        var pos = e.pageX - this.$container.offset().left;
        var percents = pos / this._getWidth();
        var value = this._getActualValue(this.min + this.range * percents);

        if (this.hasLow()) {
            var obviouslyUseHigh = value > this.high;
            var middlePointMoreInHigh = value - this.low > this.high - value;

            if (obviouslyUseHigh || middlePointMoreInHigh) {
                this.setHigh(value);
                this.$high.focus();
            }
            else {
                this.setLow(value);
                this.$low.focus();
            }
        }
        else {
            this.setValue(value);
            this.$high.focus();
        }
    }
};

Slider.prototype._refreshLow = function () {
    if (!this.hasLow()) {
        if (!this.lowDetached) {
            this.lowDetached = true;
            this.$low.detach();
        }
    }
    else {
        if (this.lowDetached) this.$low.appendTo(this.$line);
        this.$lowTitle.html(this._getFormattedValue(this.low));
    }
};

Slider.prototype._refreshHigh = function () {
    this.$highTitle.html(this._getFormattedValue(this.high));
};

Slider.prototype._refreshLine = function () {
    var left = this.hasLow() ? Math.abs(this.min - this.low) / this.range : 0;
    var width = 1 - Math.abs(this.max - this.high) / this.range - left;
    this.$line.css({
        left: (left * 100) + '%',
        width: (width * 100) + '%'
    });
};

Slider.prototype._getWidth = function () {
    if (!this._width) this._width = this.$container.outerWidth();
    return this._useCacheWidth ? this._width : this.$container.outerWidth();
};

Slider.prototype._getRatio = function () {
    return this._getWidth() / this.range;
};

Slider.prototype._toPixels = function (points) {
    return points * this._getRatio();
};

Slider.prototype._toPoints = function (pixels) {
    return pixels / this._getRatio();
};

Slider.prototype._getActualValue = function (value) {
    if (typeof value != 'number') return value;
    var stepValue = (value / this.step | 0) * this.step;
    var approxValue = Math.round((value - stepValue) / this.step) * this.step;
    return stepValue + approxValue;
};

Slider.prototype._getFormattedValue = function (value) {
    value = this._getActualValue(value);
    value = this.digits > 0 ? value.toFixed(this.digits) : Math.round(value);
    return Number(value) + this.suffix;
};

Slider.prototype.getValue = function () {
    if (!this.hasLow()) return this._getActualValue(this.high);
    return [this.low, this.high].map(this._getActualValue, this);
};

Slider.prototype.setValue = function (value, silent) {
    if (value === undefined) value = this.max;
    if (typeof value == 'string') value = Number(value);

    var isRange = Array.isArray(value);
    var low = isRange ? this._getValidLow(value[0]) : null;
    var high = this._getValidHigh(isRange ? value[1] : value);

    // do nothing if invalid value
    if (low === false) low = this.low;
    if (high === false) high = this.high;
    if (low == this.low && high == this.high) return;

    if (silent) {
        this._low = low;
        this._high = high;
    }
    else {
        this.low = low;
        this.high = high;
    }

    value = this.getValue();
    this.$input.val(value);
    if (!silent) this.trigger('change', value);

    this.update();
};

Slider.prototype._getValidLow = function (value) {
    if (isNaN(value)) return false;
    if (value < this.min) return this.min;
    if (value > this.high) return this.high;
    return Number(value);
};

Slider.prototype._getValidHigh = function (value) {
    if (isNaN(value)) return false;
    if (value > this.max) return this.max;
    if (value < this.min) return this.min;
    if (this.hasLow() && value < this.low) return this.low;
    return Number(value);
};

Slider.prototype.setLow = function (value, silent) {
    value = this._getValidLow(value);
    if (this.low != value && value !== false) {
        this.setValue([value, this.high], silent);
        return true;
    }
    return false;
};

Slider.prototype.setHigh = function (value, silent) {
    value = this._getValidHigh(value);
    if (this.high != value && value !== false) {
        if (this.hasLow()) value = [this.low, value];
        this.setValue(value, silent);
        return true;
    }
    return false;
};

Slider.prototype.hasLow = function () {
    return this.low != null;
};

Slider.prototype.update = function () {
    this._refreshLow();
    this._refreshHigh();
    this._refreshLine();
};

Slider.prototype.getDigitsAfterDot = function (number) {
    number = number || 0;
    return (String(number).split('.')[1] || '').length;
};

exports.Slider = Slider;