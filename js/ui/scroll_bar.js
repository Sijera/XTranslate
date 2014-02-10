'use strict';

var UTILS = require('../utils'),
    inherit = require('../utils').inherit,
    UIComponent = require('./ui_component').UIComponent,
    jQueryExtra = require('../libs/jquery-extra');

/** @const */ var UPDATE_DELAY = 0;   // update scroll timeout
/** @const */ var SCROLL_STEP = 5;    // percents, related to block's dimensions
/** @const */ var SCROLL_SPEED = 25;  // how fast and smooth scroll will be changing
/** @const */ var SCROLL_DELAY = 500; // delay before automatically scrolling
/** @const */ var SCROLL_SIDES = ['right', 'left'];
/** @const */ var IS_SCROLLABLE = 'scrollable';

// TODO: make support of horizontal scroll bar

/**
 * @constructor
 * @param {{$parent: (String|HTMLElement|jQuery), pos: Number, side: ("right"|"left")}} options
 */
var ScrollBar = function (options) {
    options = $.extend({side: SCROLL_SIDES[0], pos: 0, nodeType: 'span'}, options);
    ScrollBar.superclass.constructor.call(this, options);

    this.$window = $(window);
    this.realPos = options.pos;
    this.mouseMove = this.onMouseMove.bind(this);
    this.onResize = UTILS.debounce(this.onResize.bind(this), UPDATE_DELAY);

    this.createDom(options);
    this.bindEvents();
    this.hide();

};

inherit(ScrollBar, UIComponent);

/** @protected */
ScrollBar.prototype.createDom = function (options) {
    this.$container.addClass('scrollBar');
    this.$bar = $('<i class="bar"/>').appendTo(this.$container);
    this.setParent(options.$parent);
    this.setSide(options.side);
};

/** @protected */
ScrollBar.prototype.bindEvents = function () {
    this.$container.on('mousedown', this.onClick.bind(this));
    this.$bar.on('mousedown', this.onMouseDown.bind(this));

    this.$parent
        .on('scroll', this.onScroll.bind(this))
        .on('mousewheel', this.onMouseWheel.bind(this))
        .on('keydown', this.onKeyDown.bind(this));

    this.$window
        .on('mouseup', this.onMouseUp.bind(this))
        .on('keyup', this.onKeyUp.bind(this))
        .on('resize', this.onResize);
};

/** @private */
ScrollBar.prototype.setParent = function (elem) {
    if (!elem) return;
    this.$parent = $(elem).first().attr('tabIndex', -1);
    this.$parent.addClass(IS_SCROLLABLE);
};

/** @private */
ScrollBar.prototype.setSide = function (side) {
    this.side = side;
    this.$container.add(this.$parent)
        .removeClass(SCROLL_SIDES.join(' '))
        .addClass(side);
};

ScrollBar.prototype.scrollTo = function (pos, silent) {
    pos = Number(pos) || 0;
    var prevPos = this.realPos;
    this.realPos = this.$parent.scrollTop(pos).scrollTop();
    if (prevPos !== this.realPos) {
        this.barPos = Math.round(this.realPos * this.kDiff);
        this.$bar.css('top', this.barPos);
        this.$container.css({marginTop: this.realPos, marginBottom: -this.realPos});
        if (!silent) this.trigger('scroll', this.realPos);
    }
};

ScrollBar.prototype.scrollBy = function (step, silent) {
    return this.scrollTo(this.realPos + (step || 1), silent);
};

ScrollBar.prototype.update = function () {
    this.cacheDimensions();
    this.toggle(this.pVisibleHeight < this.pScrollHeight);
    this.$parent.toggleClass(this.side, !this.hidden);

    if (!this.hidden) {
        this.height = this.$container.height();
        this.padding = this.pVisibleHeight - this.height;
        this.barHeight = Math.round(this.height * this.kDiff) - this.padding;
        this.$bar.css('height', this.barHeight);
        this.barHeightDiff = this.barHeight - this.$bar.height();
        if (this.barHeightDiff) this.kDiff = (this.pVisibleHeight + this.barHeightDiff) / this.pScrollHeight;
        this.scrollTo(this.realPos, true);
    }
};

/** @private */
ScrollBar.prototype.cacheDimensions = function () {
    this.pVisibleHeight = this.$parent[0].clientHeight;
    this.pScrollHeight = this.$parent[0].scrollHeight;
    this.pageSpeed = this.pVisibleHeight / 100 * 10;
    this.scrollSpeed = this.pVisibleHeight / 100 * SCROLL_STEP;
    this.kDiff = this.pVisibleHeight / this.pScrollHeight;
};

/** @private */
ScrollBar.prototype.start = function (callback) {
    callback();
    this.scrolling = true;
    this.delayTimer = setTimeout(function () {
        this.repeatTimer = setInterval(callback, SCROLL_SPEED);
    }.bind(this), SCROLL_DELAY);
};

/** @private */
ScrollBar.prototype.stop = function () {
    if (this.hidden || !this.scrolling) return;
    clearTimeout(this.repeatTimer);
    clearTimeout(this.delayTimer);
    delete this.repeatTimer;
    delete this.delayTimer;
    delete this.scrolling;
};

/** @private */
ScrollBar.prototype.show = function () {
    if (!this.hidden) return this;
    ScrollBar.superclass.show.apply(this, arguments);
    this.$container.appendTo(this.$parent);
    return this;
};

/** @private */
ScrollBar.prototype.hide = function () {
    if (this.hidden) return this;
    ScrollBar.superclass.hide.apply(this, arguments);
    this.$container.detach();
    return this;
};

/** @private */
ScrollBar.prototype.onMouseDown = function (e) {
    this.dragging = true;
    this.mouse = {x: e.pageX, y: e.pageY};
    this.$window.on('mousemove', this.mouseMove);
};

/** @private */
ScrollBar.prototype.onMouseUp = function (e) {
    this.stop();
    if (this.dragging) {
        this.$window.off('mousemove', this.mouseMove);
        delete this.mouse;
        delete this.dragging;
    }
};

/** @private */
ScrollBar.prototype.onMouseMove = function (e) {
    var mouse = {x: e.pageX, y: e.pageY},
        offset = mouse.y - this.mouse.y,
        barPos = this.barPos;

    this.scrollBy(offset / this.kDiff);
    if (barPos !== this.barPos) this.mouse = mouse;

    // avoid total crap with selection (when "user-select: none" doesn't work)
    window.getSelection().removeAllRanges();
};

/** @private */
ScrollBar.prototype.onMouseWheel = function (e) {
    if (e.wheelDelta > 0) this.scrollBy(-this.scrollSpeed);
    if (e.wheelDelta < 0) this.scrollBy(this.scrollSpeed);
    e.stopPropagation();
};

/** @private */
ScrollBar.prototype.onScroll = function (e) {
    var realPos = this.$parent.scrollTop();
    if (realPos !== this.realPos) this.scrollTo(realPos);
};

/** @private */
ScrollBar.prototype.onClick = function (e) {
    if (e.target != this.$container[0]) return;
    var offsetY = e.offsetY || (e.pageY - this.$container.offset().top);
    var offsetDiff = offsetY - this.barPos;
    var dir = offsetDiff / Math.abs(offsetDiff);

    this.start(function () {
        this.scrollBy(this.pageSpeed * dir);
        if (dir < 0 && this.barPos <= offsetY) this.stop();
        if (dir > 0 && this.barPos + this.barHeight >= offsetY) this.stop();
    }.bind(this));
};

/** @private */
ScrollBar.prototype.onKeyDown = function (e) {
    if (this.scrolling) return;
    var prevPos = this.realPos;
    switch (e.which) {
        case 38: this.scrollBy(-this.scrollSpeed); break; // UP
        case 40: this.scrollBy(this.scrollSpeed); break; // DOWN
        case 36: this.scrollTo(0); break; // HOME
        case 35: this.scrollTo(this.pScrollHeight - this.pVisibleHeight); break; // END
        case 33: this.scrollBy(-this.pageSpeed); break; // PAGE UP
        case 34: this.scrollBy(this.pageSpeed); break; // PAGE DOWN
    }
    if (prevPos !== this.realPos) e.preventDefault();
};

/** @private */
ScrollBar.prototype.onKeyUp = function (e) {
    if (this.hidden) return;
    this.stop();
};

/** @private */
ScrollBar.prototype.onResize = function (e) {
    if (this.hidden) return;
    this.update();
};

exports.ScrollBar = ScrollBar;
