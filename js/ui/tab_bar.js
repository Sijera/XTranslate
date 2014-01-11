"use strict";

var inherit = require('../utils').inherit,
    ItemList = require('./item_list').ItemList;

/**
 * @constructor
 */
var TabBar = function (options) {
    options = $.extend(options, {selectable: true});
    TabBar.superclass.constructor.call(this, options);

    this.tabsContent = {};
};

inherit(TabBar, ItemList);

/** @protected */
TabBar.prototype.createDom = function () {
    TabBar.superclass.createDom.apply(this, arguments);
    this.$container.addClass('tabBar');
};

/**
 * Bind a tab item with its content.
 * Every time the tab is activated, contents of it will be shown automatically
 * @param {Number|Object} tabIndexOrItem
 * @param {UIComponent|jQuery|*} content
 */
TabBar.prototype.bindContent = function (tabIndexOrItem, content) {
    var tab = this.searchBy(tabIndexOrItem);
    if (tab) this.tabsContent[tab.index] = content;
    return this;
};

/** @private */
TabBar.prototype.onSelect = function (item, index) {
    TabBar.superclass.onSelect.apply(this, arguments);
    this.onActivate(index);
    this.trigger('change', item, index);
};

/** @private */
TabBar.prototype.onActivate = function (tabIndex) {
    Object.keys(this.tabsContent).forEach(function (i) {
        if (i !== tabIndex) this.tabsContent[i].hide();
    }, this);

    var content = this.getContent();
    if (content) {
        content.show();
        this.trigger('activate', content, tabIndex);
    }
};

TabBar.prototype.setValue = function (value, silent) {
    this.select(value, silent);
};

TabBar.prototype.getValue = function () {
    return this.selectedIndex;
};

TabBar.prototype.getContent = function () {
    return this.tabsContent[this.selectedIndex];
};

exports.TabBar = TabBar;