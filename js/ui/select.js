'use strict';

var UTILS = require('../utils'),
    inherit = require('../utils').inherit,
    FormControl = require('./form_control').FormControl,
    TextInput = require('./text_input').TextInput,
    ItemList = require('./item_list').ItemList,
    FlyingPanel = require('./flying_panel').FlyingPanel,
    jQueryMouseWheel = require('../libs/jquery-mousewheel');

/** @const */ var IS_OPEN = 'open';
/** @const */ var IS_CLOSED = 'closed';
/** @const */ var IS_EMPTY = 'empty';
/** @const */ var IS_INVALID = 'error';
/** @const */ var POSITIONS = [
    {left: 0, top: '100%'},
    {left: 0, bottom: '100%'},
    {right: 0, top: '100%'},
    {right: 0, bottom: '100%'}
];

/**
 * @constructor
 */
var Select = function (options) {
    options = $.extend({editable: false}, options);
    Select.superclass.constructor.call(this, options);

    /** @type {Boolean} */  this.removable = !!options.removable;
    /** @type {Boolean} */  this.editable = !!options.editable;
    /** @type {Function} */ this.editBoxClass = options.editBoxClass || TextInput;
    /** @type {Boolean} */  this.noBodyAppend = !!options.noBodyAppend;
    /** @type {String} */   this.listClassName = options.listClassName || '';
    /** @type {Number} */   this.listMaxHeight = options.listMaxHeight || 250;
    /** @type {Object} */   this.selectedItem = undefined;
    /** @type {Number} */   this.selectedIndex = -1;
    /** @type {String} */   this.state = IS_CLOSED;
    /** @type {Array} */    this.positions = options.positions || POSITIONS;
    /** @type {String} */   this.label = options.label || '';
    /** @type {String} */   this.tabIndex = options.tabIndex || 0;

    this.createDom();
    this.bindEvents();
    this.setTitle(options.title);

    Object.defineProperties(this, {
        'value': {get: this.getValue, set: this.setValue}
    });
};

inherit(Select, FormControl);

/** @protected */
Select.prototype.createDom = function () {
    this.$container.addClass('select '+ IS_CLOSED).attr('tabIndex', this.tabIndex);

    /** @type {TextInput} */
    this.editBox = new this.editBoxClass({
        readonly     : !this.editable,
        className    : 'valueHolder',
        restoreOnBlur: true
    }).appendTo(this);

    /** @type {FlyingPanel} */
    this.flyingPanel = new FlyingPanel({
        className   : 'selectList ' + this.listClassName,
        positions   : this.positions,
        anchor      : this.$container,
        noBodyAppend: this.noBodyAppend,
        autoHide    : true
    });

    /** @type {ItemList} */
    this.itemList = new ItemList({
        maxHeight : this.listMaxHeight,
        removable : this.removable,
        selectable: true,
        scrollable: true
    }).appendTo(this.flyingPanel);

    /** @type {jQuery} */
    this.$value = $('<input type="hidden"/>')
        .attr('name', this.name)
        .appendTo(this.$container);
};

/** @protected */
Select.prototype.bindEvents = function () {
    this.$container
        .on('click', this.toggleList.bind(this))
        .on('keydown', this._onKeyDown.bind(this))
        .on('keypress', this._onKeyPress.bind(this))
        .on('keyup', this._onKeyUp.bind(this))
        .on('mousewheel', this._onScroll.bind(this));

    this.editBox
        .on('tooltipReady', this._onTooltipReady.bind(this))
        .on('keydown', this._onKeyDown.bind(this))
        .on('validChanged', this._onValidChange, this)
        .on('change', this._onEditBoxChange, this);

    this.flyingPanel
        .on('hide', this.hideList.bind(this))
        .on('position', this._onListPositionChange.bind(this));

    this.itemList
        .on('remove', this._onItemRemove, this)
        .on('click', this._onItemClick, this);

    // TODO: optimize me!
    $(window).on('resize', this._onResize.bind(this));
};

/**
 * Add new item (option) to the list
 * @param {{title: String, value: *, data: *=, selected: Boolean=}|String} item New option data
 * @param {Boolean} [silent]
 */
Select.prototype.add = function (item, silent) {
    var itemObj = this.itemList.add(item, true);
    var selected = itemObj.selected || this.getItemsCount() === 1;
    if (selected) this._setSelectedItem(itemObj, silent);
    return itemObj;
};

/**
 * Remove an option by value, index or item object
 * @param {Object|Number|*} value
 * @param {Boolean} [silent]
 */
Select.prototype.remove = function (value, silent) {
    var item = this._getItemBy('value', value);
    if (!item) item = value;
    this.itemList.remove(item, silent);
};

Select.prototype.clear = function () {
    if (!this.getItemsCount()) return;
    this.hideList();
    this.itemList.clear();
    this._clearSelectedItem();
    this._onChange(true, '', this.getValue());
};

/** @protected */
Select.prototype._clearSelectedItem = function () {
    this.selectedIndex = -1;
    delete this.selectedItem;
    this.itemList.unSelect();
};

Select.prototype.showList = function () {
    if (this.state == IS_OPEN || !this.enabled) return;
    this.$container.addClass(this.state = IS_OPEN).removeClass(IS_CLOSED);
    this.flyingPanel.$container.toggleClass(IS_EMPTY, !this.getItemsCount());
    this.flyingPanel.show();
    this.itemList.update();
    this.updateLabel();
    this.update();
};

Select.prototype.hideList = function () {
    if (this.state == IS_CLOSED) return;
    this.$container.addClass(this.state = IS_CLOSED).removeClass(IS_OPEN);
    this.flyingPanel.hide();
    this.updateLabel();
};

Select.prototype.toggleList = function () {
    if (this.state == IS_CLOSED) this.showList();
    else this.hideList();
};

Select.prototype.update = function () {
    if (this.state == IS_CLOSED) return;
    this.itemList.scrollIntoSelect();
};

Select.prototype.getItemsCount = function () {
    return this.itemList.getCount();
};

Select.prototype.selectByIndex = function (index, silent) {
    var item = this.itemList.getList()[index];
    return this._setSelectedItem(item, silent);
};

Select.prototype.selectByData = function (data, silent) {
    return this._selectBy('data', data, silent);
};

Select.prototype.selectByValue = function (value, silent) {
    return this._selectBy('value', value, silent);
};

Select.prototype.selectByTitle = function (title, silent) {
    return this._selectBy('title', title, silent);
};

/** @protected */
Select.prototype._selectBy = function (field, value, silent) {
    var item = this._getItemBy(field, value);
    return this._setSelectedItem(item, silent);
};

/** @protected */
Select.prototype._getItemBy = function (field, value) {
    var items = this.itemList.getList();
    for (var i = 0; i < items.length; i++) {
        if (items[i][field] == value) return items[i];
    }
    return null;
};

/** @protected */
Select.prototype._setSelectedItem = function (item, silent) {
    if (!item || item.disabled) return null;
    if (item === this.selectedItem) return false;
    var prev = this._getPreValue();
    this.selectedItem = item;
    this.selectedIndex = this.itemList.getList().indexOf(item);
    this.itemList.select(this.selectedIndex);
    this._onChange(silent, this.getValue(), prev);
    this.update();
    return true;
};

Select.prototype.setValue = function (value, silent) {
    var selected = this.selectByValue(value, silent);
    if (selected == null) {
        var prev = this._getPreValue();
        this._clearSelectedItem();
        this._onChange(silent, value, prev);
    }
};

Select.prototype.getValue = function () {
    if (this.selectedItem) return this.selectedItem.value;
    if (this.editable) return this.editBox.getValue();
    return null;
};

Select.prototype.setData = function (data) {
    if (this.selectedItem) this.selectedItem.data = data;
};

Select.prototype.getData = function () {
    return this.selectedItem ? this.selectedItem.data : null;
};

/** @protected */
Select.prototype._getPreValue = function () {
    return this.prevTypedText !== undefined ? this.prevTypedText : this.getValue();
};

/** @protected */
Select.prototype._onChange = function (silent, value, prev) {
    var boxValue = this.editable || !this.selectedItem ? value : this.selectedItem.title;
    value = this.editable || this.selectedItem ? value : null;
    this.$value.val(value);
    if (!this.showingLabel) this.editBox.setValue(boxValue, false, this.isTyping);
    if (!silent && value != prev) this.trigger('change', value, prev);
};

/** @protected */
Select.prototype._onEditBoxChange = function (value, prev) {
    this.isTyping = true;
    this.prevTypedText = prev;
    this.setValue(value);
    delete this.prevTypedText;
    delete this.isTyping;
};

/** @protected */
Select.prototype._onItemClick = function (item) {
    this.hideList();
    this._setSelectedItem(item);
};

/** @protected */
Select.prototype._onItemRemove = function (item) {
    if (item.selected) this.setValue('', true);
    if (this.getItemsCount() === 0) this.hideList();
    this.trigger('remove', item);
};

/** @protected */
Select.prototype._onScroll = function (e) {
    var item = this.itemList.getNextItem(e.wheelDelta > 0);
    if (item) this._setSelectedItem(item);
    e.stopPropagation();
    e.preventDefault();
};

/** @protected */
Select.prototype._onKeyPress = function (e) {
    if (this.editable) return;
    if (this._searchText === undefined) this._searchText = '';
    this._searchText += String.fromCharCode(e.which).toLowerCase();

    var searchTheSame = this._searchPrev == this._searchText;
    this._searchRepeat = searchTheSame ? ++this._searchRepeat : 0;

    if (searchTheSame) {
        var item = this._searchListPrev[this._searchRepeat];
        if (!item) item = this._searchListPrev[this._searchRepeat = 0];
        this._setSelectedItem(item);
    }
    else {
        this._searchList = UTILS.objLookup(this.itemList.getList(), 'title', this._searchText);
        this._searchList = this._searchList.filter(function (item) { return !item.disabled });
        this._setSelectedItem(this._searchList[0]);
    }
};

/** @protected */
Select.prototype._onKeyUp = function () {
    if (this.editable) return;
    this._searchPrev = this._searchText;
    this._searchListPrev = this._searchList || this._searchListPrev;
    delete this._searchText;
    delete this._searchList;
};

/** @protected */
Select.prototype._onKeyDown = function (e) {
    var item, keyCode = e.which;

    if (keyCode == 38) item = this.itemList.getNextItem(true); // UP
    if (keyCode == 40) item = this.itemList.getNextItem(); // DOWN
    if (keyCode == 13) this.hideList(); // ENTER
    if (keyCode == 27 && this.state == IS_OPEN) { // ESCAPE
        this.hideList();
        e.stopPropagation();
    }

    if (item) {
        this._setSelectedItem(item);
        e.preventDefault();
        e.stopPropagation();
    }
};

/** @protected */
Select.prototype._onValidChange = function (valid) {
    this.valid = valid;
    this.$container.toggleClass(IS_INVALID, !valid);
};

/** @protected */
Select.prototype._onListPositionChange = function (pos, prev) {
    this.$container.removeClass(prev).addClass(pos);
};

/** @protected */
Select.prototype._onResize = function () {
    if (this.state == IS_CLOSED || this.noBodyAppend) return;
    this.flyingPanel.update();
};

/** @protected */
Select.prototype._onTooltipReady = function () {
    this.editBox.tooltip.$container.appendTo(this.$container);
    this.editBox.tooltip.setAnchor(this.$container);
};

Select.prototype.addValidator = function () {
    return this.editBox.addValidator.apply(this.editBox, arguments);
};

Select.prototype.removeValidator = function () {
    return this.editBox.removeValidator.apply(this.editBox, arguments);
};

Select.prototype.updateLabel = function () {
    if (!this.label || this.editable) return;
    this.showingLabel = this.state == IS_OPEN;
    this.editBox.setValue(this.state == IS_CLOSED ? this.selectedItem.title : this.label);
};

exports.Select = Select;