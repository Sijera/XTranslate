"use strict";

var inherit = require('../utils').inherit,
    EventDriven = require('../events').EventDriven;

/**
 * @constructor
 * @param {{step?: Number, axis?: DragAndDrop.AXIS_X|DragAndDrop.AXIS_Y|DragAndDrop.AXIS_BOTH}} options
 */
var DragAndDrop = function (options) {
    DragAndDrop.superclass.constructor.call(this, options = options || {});

    this.dragging = false;
    this.enabled = true;
    this.mouse = {};
    this.$window = $(window);
    this.$dragElems = $();
    this.$dropElems = $();
    this.$activeDrops = $();
    this.$activeDrag = undefined;

    this.step = options.step || 1;
    this.onePixelStep = this.step === 1;
    this.axis = options.axis || DragAndDrop.AXIS_BOTH;
    this.allowX = this.axis == DragAndDrop.AXIS_X || this.axis == DragAndDrop.AXIS_BOTH;
    this.allowY = this.axis == DragAndDrop.AXIS_Y || this.axis == DragAndDrop.AXIS_BOTH;

    this._dragInit = this.onDragInit.bind(this);
    this._dragEnter = this.onDragEnter.bind(this);
    this._dragEnd = this.onDragEnd.bind(this);
    this._dropOver = this.onDropOver.bind(this);
    this._dropOut = this.onDropOut.bind(this);
};

inherit(DragAndDrop, EventDriven);

/** @const */ DragAndDrop.AXIS_X = 'x';
/** @const */ DragAndDrop.AXIS_Y = 'y';
/** @const */ DragAndDrop.AXIS_BOTH = '';
/** @const */ DragAndDrop.DROP_OVER_CLASS = 'dropOver';
/** @const */ DragAndDrop.DRAG_IN_PROCESS_CLASS = 'dragging';
/** @const */ DragAndDrop.DRAG_OBJ_CLASS = 'draggable';
/** @const */ DragAndDrop.DROP_OBJ_CLASS = 'droppable';

/**
 * Add a set of DOM elements to be a draggable
 * @param {jQuery|String|HTMLElement} items
 */
DragAndDrop.prototype.addDragObj = function (items) {
    var $items = items;
    if (typeof items == 'string' || items instanceof HTMLElement) $items = $(items);
    this.$dragElems = this.$dragElems.add($items);
    $items.addClass(DragAndDrop.DRAG_OBJ_CLASS);
    $items.on('mousedown', this._dragInit);
};

/**
 * Add a set of DOM elements to drop the draggable
 * @param {jQuery|String|HTMLElement} items
 */
DragAndDrop.prototype.addDropObj = function (items) {
    var $items = items;
    if (typeof items == 'string' || items instanceof HTMLElement) $items = $(items);
    $items.addClass(DragAndDrop.DROP_OBJ_CLASS);
    this.$dropElems = this.$dropElems.add($items);
};

/** @private */
DragAndDrop.prototype.resetMouseObj = function (data) {
    return $.extend(this.mouse, {
        initX  : 0, initY: 0,   // initial values of the mouse position when drag init happened
        offsetX: 0, offsetY: 0, // offset from the initial point where the drag is happened
        stepX  : 0, stepY: 0,   // offset in steps
        pageX  : 0, pageY: 0    // global value of mouse position relative to the page
    }, data);
};

/** @private */
DragAndDrop.prototype.createEvent = function (eventName, jQueryEvent, target, extraData) {
    var eventObj = $.extend({domEvent: jQueryEvent, type: eventName}, this.mouse, extraData);
    if (target !== undefined) eventObj.target = target;
    this.trigger(eventName, eventObj);
    return eventObj;
};

/** @private */
DragAndDrop.prototype.onDragInit = function (e) {
    if (!this.enabled) return;
    this.$activeDrag = this.$dragElems.filter(e.target);
    this.bindDragEvents();
    this.resetMouseObj({
        initX: e.pageX, initY: e.pageY,
        pageX: e.pageX, pageY: e.pageY
    });
    this.createEvent('drag:init', e, this.$activeDrag);
};

/** @private */
DragAndDrop.prototype.onDragStart = function (e) {
    this.dragging = true;
    this.$activeDrag.addClass(DragAndDrop.DRAG_IN_PROCESS_CLASS);
    this.bindDropEvents();
    this.createEvent('drag:start', e, this.$activeDrag);
};

/** @private */
DragAndDrop.prototype.onDragEnter = function (e) {
    var offsetX = e.pageX - this.mouse.initX,
        offsetY = e.pageY - this.mouse.initY,
        stepXPrev = this.mouse.stepX,
        stepYPrev = this.mouse.stepY,
        stepX = this.allowX ? stepXPrev - (this.onePixelStep ? offsetX : (0 | offsetX / this.step) * this.step) : 0,
        stepY = this.allowY ? stepYPrev - (this.onePixelStep ? offsetY : (0 | offsetY / this.step) * this.step) : 0;

    $.extend(this.mouse, {
        offsetX: offsetX,
        offsetY: offsetY,
        stepX  : stepX,
        stepY  : stepY,
        pageX  : e.pageX,
        pageY  : e.pageY
    });

    if ((this.allowX && stepXPrev !== this.mouse.stepX) ||
        (this.allowY && stepYPrev !== this.mouse.stepY)) {
        if (!this.dragging) this.onDragStart(e);
        this.createEvent('drag:change', e, this.$activeDrag);
    }
};

/** @private */
DragAndDrop.prototype.onDragEnd = function (e) {
    var $dropTarget = this.$activeDrop,
        success = $dropTarget !== undefined;

    if (success) this.onDropSuccess(e);

    this.dragging = false;
    this.$activeDrag.removeClass(DragAndDrop.DRAG_IN_PROCESS_CLASS);
    this.unBindEvents();
    this.createEvent('drag:end', e, $dropTarget, {success: success});
    delete this.$activeDrag;
};

/** @private */
DragAndDrop.prototype.onDropOver = function (e) {
    this.$activeDrop = this.$dropElems.filter(e.target);
    this.$activeDrop.addClass(DragAndDrop.DROP_OVER_CLASS);
    this.$activeDrops = this.$activeDrops.add(this.$activeDrop);
    this.createEvent('drop:over', e, this.$activeDrop);
};

/** @private */
DragAndDrop.prototype.onDropOut = function (e) {
    var $dropObj = this.$dropElems.filter(e.target);
    $dropObj.removeClass(DragAndDrop.DROP_OVER_CLASS);
    this.$activeDrops = this.$activeDrops.not($dropObj);
    delete this.$activeDrop;
    this.createEvent('drop:out', e, $dropObj);
};

/** @private */
DragAndDrop.prototype.onDropSuccess = function (e) {
    var evtCopy = $.extend({}, e);

    this.$activeDrops.each(function (i, dropTarget) {
        evtCopy.target = dropTarget;
        this.onDropOut(evtCopy);
    }.bind(this));

    this.$activeDrops.length = 0;
};

/** @private */
DragAndDrop.prototype.bindDragEvents = function () {
    this.$window
        .on('mousemove', this._dragEnter)
        .on('mouseup', this._dragEnd);
};

/** @private */
DragAndDrop.prototype.bindDropEvents = function () {
    this.$dropElems
        .on('mouseenter', this._dropOver)
        .on('mouseleave', this._dropOut);
};

/** @private */
DragAndDrop.prototype.unBindEvents = function () {
    this.$window
        .off('mousemove', this._dragEnter)
        .off('mouseup', this._dragEnd);

    this.$dropElems
        .off('mouseenter', this._dropOver)
        .off('mouseleave', this._dropOut);
};

DragAndDrop.prototype.disable = function () {
    this.enabled = false;
};

DragAndDrop.prototype.enable = function () {
    this.enabled = true;
};

exports.DragAndDrop = DragAndDrop;