"use strict";

var inherit = require('../utils').inherit,
    ScrollBar = require('./scroll_bar').ScrollBar,
    UIComponent = require('./ui_component').UIComponent;

/** @const */ var IS_SELECTED = 'selected';
/** @const */ var IS_DISABLED = 'disabled';
/** @const */ var IS_REMOVABLE = 'removable';
/** @const */ var IS_SCROLLABLE = 'scrollable';
/** @const */ var IS_SELECTABLE = 'selectable';

/**
 * @constructor
 * @param {{scrollable: Boolean, selectable: Boolean, showTitles: Boolean, scrollSide: String}} options
 */
var ItemList = function (options) {
    options = $.extend({nodeType: 'ul'}, options);
    ItemList.superclass.constructor.call(this, options);

    this.items = [];
    this.selectedIndex = -1;
    this.selectable = !!options.selectable;
    this.scrollable = !!options.scrollable;
    this.showTitles = !!options.showTitles;
    this.scrollSide = options.scrollSide;
    this.removable = !!options.removable;

    this.createDom(options);
};

inherit(ItemList, UIComponent);

/** @protected */
ItemList.prototype.createDom = function (options) {
    this.$container.addClass('itemList');
    this.$container
        .toggleClass(IS_SCROLLABLE, this.scrollable)
        .toggleClass(IS_SELECTABLE, this.selectable)
        .toggleClass(IS_REMOVABLE, this.removable);

    if (this.scrollable) this.scrollBar = new ScrollBar({$parent: this.$container, side: this.scrollSide});
    this.setMaxHeight(options.maxHeight, true);
};

/**
 * Add a new item to the list
 * @param {String|{title, value, data, selected, disabled, className, removeTitle}} item
 * @param {Boolean} [silent]
 */
ItemList.prototype.add = function (item, silent) {
    var isNumeric = typeof item == 'number';
    var itemObj = (typeof item == 'string' || isNumeric) ? {title: item, value: item, selected: false} : item;
    if (itemObj.value === undefined) itemObj.value = itemObj.title;
    if (itemObj.title === undefined || isNumeric) itemObj.title = String(itemObj.value);

    itemObj.$el = $('<li><span class="item"/></li>')
        .addClass(itemObj.className)
        .attr('title', this.showTitles ? itemObj.title : undefined)
        .on('click', this.onClickItem.bind(this, itemObj))
        .appendTo(this.$container);

    itemObj.$el.find('.item').text(itemObj.title);

    if (this.removable) {
        $('<i class="removeIcon"/>')
            .attr('title', itemObj.removeTitle)
            .on('click', this.onRemoveItem.bind(this, itemObj, false))
            .appendTo(itemObj.$el);
    }

    this.items.push(itemObj);
    if (itemObj.selected) this.select(itemObj);
    if (itemObj.disabled) this.disable(itemObj, true);
    if (!silent) this.update();

    return itemObj;
};

/**
 * Remove the item with DOM-representation from the list
 * @param {Number|Object} itemOrIndex
 * @param {Boolean} [silent]
 * @returns {boolean}
 */
ItemList.prototype.remove = function (itemOrIndex, silent) {
    var found = this.searchBy(itemOrIndex);
    if (!found) return false;

    var item = found.item;
    item.$el.remove();
    this.items.splice(found.index, 1);
    if (item.selected) this.selectedIndex = -1;
    if (!silent) this.trigger('remove', item);

    this.update();
    return true;
};

ItemList.prototype.clear = function (silent) {
    this.selectedIndex = -1;
    this.items.forEach(function (item) { item.$el.remove() });
    this.items.length = 0;
    if (!silent) this.update();
};

ItemList.prototype.update = function () {
    if (this.scrollable) this.scrollBar.update();
    return this;
};

ItemList.prototype.select = function (itemOrIndex, silent) {
    if (!this.selectable) return;
    var found = this.searchBy(itemOrIndex);
    if (found) {
        var item = found.item;
        var index = found.index;
        if (index == this.selectedIndex) return;
        this.unSelect();
        item.$el.addClass(IS_SELECTED);
        item.selected = true;
        this.selectedIndex = index;
        if (!silent) this.onSelect(item, index);
    }
};

ItemList.prototype.unSelect = function () {
    if (!this.selectable) return;
    var item = this.getSelectedItem();
    if (!item) return;
    item.$el.removeClass(IS_SELECTED);
    item.selected = false;
    this.selectedIndex = -1;
    this.trigger('unSelect', item);
};

/** @protected */
ItemList.prototype.onSelect = function (item, index) {
    this.trigger('select', item, index);
};

ItemList.prototype.getCount = function () {
    return this.items.length;
};

ItemList.prototype.getList = function () {
    return this.items;
};

ItemList.prototype.getSelectedItem = function () {
    return this.items[this.selectedIndex];
};

/** @protected */
ItemList.prototype.searchBy = function (itemOrIndex) {
    var item, index = -1;
    if (typeof itemOrIndex == 'number') {
        index = itemOrIndex;
        item = this.items[index];
    }
    else {
        index = this.items.indexOf(itemOrIndex);
        item = this.items[index];
    }
    return item ? {item: item, index: index} : null;
};

/** @private */
ItemList.prototype.onClickItem = function (item, e) {
    var selected = this.getSelectedItem();
    if (item !== selected) this.select(item);
    this.trigger('click', item, e);
};

/** @private */
ItemList.prototype.onRemoveItem = function (itemOrIndex, silent, e) {
    this.remove(itemOrIndex, silent);
    e.stopPropagation();
};

ItemList.prototype.setMaxHeight = function (height, silent) {
    if (height === undefined) return;
    this.$container.css('maxHeight', height);
    if (!silent) this.update();
};

ItemList.prototype.scrollIntoSelect = function () {
    if (!this.scrollable || this.scrollBar.hidden) return;
    var item = this.getSelectedItem();
    if (item) {
        var pos = this.selectedIndex > 0 ? this.scrollBar.realPos + item.$el.position().top : 0;
        this.scrollBar.scrollTo(pos);
    }
};

ItemList.prototype.disable = function (itemOrIndex, force) {
    var item = (this.searchBy(itemOrIndex) || {}).item;
    if (!item || (item.disabled && !force)) return;
    item.disabled = true;
    item.$el.addClass(IS_DISABLED);
};

ItemList.prototype.enable = function (itemOrIndex) {
    var item = (this.searchBy(itemOrIndex) || {}).item;
    if (!item || !item.disabled) return;
    item.disabled = false;
    item.$el.removeClass(IS_DISABLED);
};

/**
 * Get next or previous active item (not disabled)
 * @param {Boolean} [backward]
 */
ItemList.prototype.getNextItem = function (backward) {
    var item,
        step = backward ? -1 : +1,
        index = this.selectedIndex;
    while (item = this.items[index + step]) {
        index += step;
        if (!item.disabled) return item;
    }
    return null;
};

exports.ItemList = ItemList;