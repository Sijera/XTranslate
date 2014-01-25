'use strict';

var UTILS = require('../utils'),
    inherit = UTILS.inherit,
    EventDriven = require('../events').EventDriven;

/**
 * Base class for all UI components
 * @constructor
 * @param {{container: jQuery, className: String, nodeType: String, name: String, state: Object=}} options
 */
var UIComponent = function (options) {
    options = $.extend({nodeType: 'div'}, options);
    UIComponent.superclass.constructor.call(this, options);

    this.name = options.name || '';
    this.state = options.state || {};
    this.$container = options.container !== undefined ? $(options.container) : UTILS.spawnElement('<' + options.nodeType + '>');
    this.$container.addClass(options.className);
};

inherit(UIComponent, EventDriven);

/**
 * Add an element to $container
 * @return {jQuery|UIComponent} element
 */
UIComponent.prototype.append = function (element) {
    if (element instanceof UIComponent) {
        this.$container.append(element.$container);
        return element;
    }

    var $el = element instanceof jQuery ? element : $(element);
    this.$container.append($el);

    return $el;
};

/**
 * Reverse form of .append()
 * @param {UIComponent|Element|jQuery} parent
 */
UIComponent.prototype.appendTo = function (parent) {
    if (parent instanceof Element) parent.appendChild(this.$container[0]);
    else parent.append(this.$container);
    return this;
};

UIComponent.prototype.show = function (force) {
    if (!this.hidden && !force) return this;
    this.hidden = false;
    this.$container.show();
    this.trigger('show');
    return this;
};

UIComponent.prototype.hide = function (force) {
    if (this.hidden && !force) return this;
    this.hidden = true;
    this.$container.hide();
    this.trigger('hide');
    return this;
};

/**
 * Show or hide component depends on condition
 * @param {Boolean} [condition]
 */
UIComponent.prototype.toggle = function (condition) {
    if (condition !== undefined) {
        if (condition) this.show();
        else this.hide();
    }
    else {
        if (this.hidden) this.show();
        else this.hide();
    }
};

UIComponent.prototype.destroy = function () {
    this.$container.remove();
};

exports.UIComponent = UIComponent;
