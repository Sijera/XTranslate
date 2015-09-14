'use strict';

var UTILS = require('../utils'),
    inherit = require('../utils').inherit,
    UIComponent = require('./ui_component').UIComponent;

/**
 * @constructor
 */
var FlyingPanel = function (options) {
    FlyingPanel.superclass.constructor.call(this, options = options || {});

    /** @type {Array} */ this.positions = options.positions || POSITIONS;
    /** @type {HTMLElement} */ this.borderElem = options.borderElem || document.body;
    /** @type {HTMLElement} */ this.anchor = options.anchor || document.body;
    /** @type {Boolean} */ this.autoUpdate = options.autoUpdate !== false;
    /** @type {Boolean} */ this.autoHide = !!options.autoHide;
    /** @type {Boolean} */ this.noBodyAppend = !!options.noBodyAppend;
    /** @type {Boolean} */ this.fitToWidth = options.fitToWidth !== false; // set a calculated width from the anchor

    this.hidden = true;
    this.$container.addClass('flyingPanel');
    this.positions.push(this.positions[0]); // used as default in case if nothing fits
    this.setAnchor(this.anchor);
};

inherit(FlyingPanel, UIComponent);

/**
 * Default positions in order of priority (relative to the anchor)
 * Extra margin in pixels can be defined in CSS
 * @private
 */
var POSITIONS = [
    {top: '100%', left: 0, className: 'bottomLeft'},
    {top: '100%', right: 0, className: 'bottomRight'},
    {bottom: '100%', left: 0, className: 'topLeft'},
    {bottom: '100%', right: 0, className: 'topRight'},
    {left: '100%', top: 0, className: 'rightTop'},
    {left: '100%', bottom: 0, className: 'rightBottom'},
    {right: '100%', top: 0, className: 'leftTop'},
    {right: '100%', bottom: 0, className: 'leftBottom'}
];

/** @const */
var RESET_STYLES = {
    position: 'absolute',
    left    : 'auto',
    top     : 'auto',
    right   : 'auto',
    bottom  : 'auto'
};

FlyingPanel.prototype.show = function (force) {
    FlyingPanel.superclass.show.apply(this, arguments);
    this.$container.appendTo(this.noBodyAppend ? this.anchor : this.borderElem);
    if (this.autoUpdate || force) this.update();
    this.bindAutoHide();
    return this;
};

FlyingPanel.prototype.hide = function () {
    if (this.hidden) return this;
    FlyingPanel.superclass.hide.apply(this, arguments);
    this.$container.detach();
    this.unbindAutoHide();
    return this;
};

FlyingPanel.prototype.update = function () {
    this.refreshDimensions();

    var prevPos = this.position,
        positions = this.positions;

    for (var i = 0; i < positions.length; i++) {
        this.setPosition(positions[i]);
        if (!this.isOutOfBorders()) break;
    }

    if (prevPos !== this.position) {
        this.$container.removeClass(prevPos).addClass(this.position);
        this.trigger('position', this.position, prevPos);
    }
};

/**
 * @param {HTMLElement|jQuery|UIComponent|*} anchor
 */
FlyingPanel.prototype.setAnchor = function (anchor) {
    if (anchor instanceof HTMLElement) var $anchor = $(anchor);
    else if (anchor instanceof jQuery) $anchor = anchor;
    else if (anchor instanceof UIComponent) $anchor = anchor.$container;

    if ($anchor) {
        this.$anchor = $anchor;
        this.anchor = $anchor[0];
    }
    return this;
};

/**
 * Set a new position (relative to the anchor)
 * @private
 * @param {{left, top, right, bottom}} position
 */
FlyingPanel.prototype.setPosition = function (position) {
    var pos = this.preparePosition(position);
    if (this.fitToWidth) pos.width = Math.min(this.anchorRect.width, this.maxWidth);

    this.position = this.getPositionClassName(position);
    this.$container.css(pos).toggleClass('large', !this.fitToWidth && this.containerRect.width > pos.width);
    this.containerRect = this.getElementRect(this.$container);
};

/** @private */
FlyingPanel.prototype.getPositionClassName = function (pos) {
    return Object.keys(pos).map(function (param) {
        if (param == 'className') return pos[param];
        return 'fp-' + param;
    }).join(' ');
};

/**
 * Convert related left/top/right/bottom-positions of the flying object to absolute values if it's located not inside the anchor
 * @private
 * @param position
 * @returns {Object} Resulted styles for $.css()
 */
FlyingPanel.prototype.preparePosition = function (position) {
    var pos = $.extend({}, position);
    if (pos.className) delete pos.className;

    if (this.noBodyAppend) {
        this.$anchor.css('position', 'relative');

        Object.keys(pos).forEach(function (side) {
            if (typeof pos[side] == 'string') return;
            pos[side] -= parseInt(this.$anchor.css('border-' + side + '-width'));
        }, this);
    }
    else {
        Object.keys(pos).forEach(function (side) {
            var horizontal = side == 'left' || side == 'right';
            var inverse = side == 'right' || side == 'bottom' ? -1 : 1;

            var posValue = this.anchorRect[side];
            var boxSize = this.anchorRect[horizontal ? 'width' : 'height'];
            var scrollValue = this.viewScroll[horizontal ? 'left' : 'top'] * inverse;

            var offset = String(pos[side]).indexOf('%') > -1
                ? parseInt(pos[side]) / 100 * boxSize
                : parseInt(pos[side]);

            if (side == 'bottom') posValue = this.borderRect.height - posValue;
            if (side == 'right') posValue = this.borderRect.width - posValue;
            pos[side] = posValue + offset + scrollValue;
        }, this);
    }

    return $.extend({}, RESET_STYLES, pos);
};

/**
 * @private
 * @param {HTMLElement|jQuery} elem
 */
FlyingPanel.prototype.getElementRect = function (elem) {
    if (elem.jquery) elem = elem[0];
    return $.extend({}, elem.getBoundingClientRect());
};

/** @private */
FlyingPanel.prototype.getViewPortScroll = function () {
    return {
        top : window.pageYOffset,
        left: window.pageXOffset
    };
};

/** @private */
FlyingPanel.prototype.getViewPortRect = function () {
    var rect = {left: 0, top: 0};
    rect.width = rect.right = window.innerWidth;
    rect.height = rect.bottom = window.innerHeight;
    return rect;
};

/** @protected */
FlyingPanel.prototype.refreshDimensions = function () {
    this.containerRect = this.getElementRect(this.$container);
    this.anchorRect = this.getElementRect(this.anchor);
    this.borderRect = this.getElementRect(this.borderElem);
    this.viewScroll = this.getViewPortScroll();
    this.viewRect = this.getViewPortRect();
    this.maxWidth = parseInt(this.$container.css('max-width')) || Infinity;
};

/** @private */
FlyingPanel.prototype.isOutOfBorders = function () {
    var elem = this.containerRect,
        border = this.viewRect;

    return elem.left < border.left
        || elem.right > border.right
        || elem.top < border.top
        || elem.bottom > border.bottom;
};

/** @private */
FlyingPanel.prototype.bindAutoHide = function () {
    if (!this.autoHide) return;

    if (!this.autoHideInited) {
        this.autoHideInited = true;
        this.$window = $(window);
        this.autoHideHandler = this.autoHideHandler.bind(this);
    }

    this.$window.on('keydown mousedown', this.autoHideHandler);
};

/** @private */
FlyingPanel.prototype.unbindAutoHide = function () {
    if (!this.autoHideInited) return;
    this.$window.off('keydown mousedown', this.autoHideHandler);
};

/** @private */
FlyingPanel.prototype.autoHideHandler = function (e) {
    switch (e.type) {
        case 'mousedown':
            var elem = e.target;
            if (this.$container[0].contains(elem) || this.$anchor[0].contains(elem)) return;
            this.hide();
            break;

        case 'keydown':
            var keyCode = e.which;
            if (keyCode == 27 /*ESCAPE*/) this.hide();
            break;
    }
};

exports.FlyingPanel = FlyingPanel;