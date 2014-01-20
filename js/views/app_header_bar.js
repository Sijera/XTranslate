'use strict';

var inherit = require('../utils').inherit,
    TabBar = require('../ui/tab_bar').TabBar,
    UIComponent = require('../ui/ui_component').UIComponent;

/**
 * @constructor
 */
var AppHeaderBar = function (options) {
    AppHeaderBar.superclass.constructor.call(this, options);

    this.createDom();
};

inherit(AppHeaderBar, UIComponent);

/** @private */
AppHeaderBar.prototype.createDom = function () {
    this.$container.addClass('appHeaderBar');

    var info = APP.extension.getInfo();
    $('<span class="name"/>').text(info.name).attr('title', info.description).appendTo(this.$container);
    $('<span class="version"/>').text(info.version).appendTo(this.$container);

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
    this.state.activeTab = tabIndex;
};

AppHeaderBar.prototype.refresh = function () {
    this.tabBar.setValue(this.state.activeTab);
    return this;
};

exports.AppHeaderBar = AppHeaderBar;