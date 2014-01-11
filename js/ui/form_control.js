'use strict';

var inherit = require('../utils').inherit,
    UIComponent = require('./ui_component').UIComponent;

/**
 * Base class for all form controls (inputs, buttons, selects, etc)
 * @constructor
 */
var FormControl = function (options) {
    FormControl.superclass.constructor.call(this, options);

    this.$container.addClass('formControl');
    this._enabled_ = true;
    this._valid_ = true;
};

inherit(FormControl, UIComponent);

Object.defineProperty(FormControl.prototype, 'enabled', {
    get : function () { return this._enabled_ },
    set : function (v) {
        if (this._enabled_ == v) return;
        this._enabled_ = !!v;
        this._repaintEnabledState_();
        this.trigger('enabledChanged', v);
    }
});

Object.defineProperty(FormControl.prototype, 'valid', {
    get: function () { return this._valid_ },
    set : function (v) {
        if (this._valid_ == v) return;
        this._valid_ = !!v;
        this._repaintErrorState_();
        this.trigger('validChanged', this._valid_);
    }
});

FormControl.prototype.setTitle = function (title) {
    if (typeof title !== 'string') return;
    this.title = title;
    this.$container.attr('title', title);
};

FormControl.prototype.disable = function () {
    this.enabled = false;
    return this;
};

FormControl.prototype.enable = function () {
    this.enabled = true;
    return this;
};

FormControl.prototype.toggle = function (enable) {
    if(enable !== undefined) enable ? this.enable() : this.disable();
    else !this.enabled ? this.enable() : this.disable();
    return this;
};

FormControl.prototype._repaintEnabledState_ = function () {
    this.$container.toggleClass('disabled', !this.enabled);
};

FormControl.prototype._repaintErrorState_ = function () {
    this.$container.toggleClass('error', !this.valid);
};

exports.FormControl = FormControl;
