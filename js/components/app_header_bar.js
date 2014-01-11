'use strict';

var inherit = require('../utils').inherit,
    TabBar = require('../ui/tab_bar').TabBar,
    UIComponent = require('../ui/ui_component').UIComponent;

/**
 * @constructor
 */
var AppHeaderBar = function (options) {
    AppHeaderBar.superclass.constructor.call(this, options);

    this.tabIndex = this.state['tabIndex'] || 0;
    this.createDom();
};

inherit(AppHeaderBar, UIComponent);

/** @private */
AppHeaderBar.prototype.createDom = function () {
    this.$container.addClass('appHeaderBar');

    var info = APP.extension.getInfo();
    this.$title = $('<span class="name"/>').text(info.name).attr('title', info.description).appendTo(this.$container);
    this.$version = $('<span class="version"/>').text(info.version).appendTo(this.$container);

    /** @type {TabBar} */
    this.tabBar = new TabBar().on('change', this.onTabChange, this).appendTo(this);
};

AppHeaderBar.prototype.addTab = function (tabData, content) {
    var tab = this.tabBar.add(tabData);
    if (content) this.tabBar.bindContent(tab, content);
    return this;
};

/** @private */
AppHeaderBar.prototype.onTabChange = function (tabItem, tabIndex) {
    this.tabIndex = tabIndex;
};

AppHeaderBar.prototype.refresh = function () {
    this.tabBar.setValue(this.tabIndex);
    return this;
};

AppHeaderBar.prototype.getState = function () {
    return {
        'tabIndex': this.tabIndex
    };
};

exports.AppHeaderBar = AppHeaderBar;