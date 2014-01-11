'use strict';

var UTILS = require('../utils'),
    inherit = UTILS.inherit,
    FormControl = require('./form_control').FormControl;

/**
 * @constructor
 */
var Button = function (options) {
    options = $.extend({nodeType: 'button'}, options);
    Button.superclass.constructor.call(this, options);

    this.createDom();
    this.setText(options.text);
    this.setTitle(options.title);
};

inherit(Button, FormControl);

Button.prototype.createDom = function () {
    this.$container.addClass('button').on('click', this.onClick.bind(this));
    this.$textBlock = this.$container;
};

Button.prototype.setText = function (text) {
    if (!text) return this;
    this.text = text;
    this.$textBlock.html(this.text);
    return this;
};

Button.prototype.setTitle = function (title) {
    this.$textBlock.attr('title', title);
    return this;
};

/** @protected */
Button.prototype.onClick = function (e) {
    e.preventDefault();
    if (!this.enabled) return;
    this.trigger('click', e);
};

exports.Button = Button;
