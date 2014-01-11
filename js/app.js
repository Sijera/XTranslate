'use strict';

var inherit = require('./utils').inherit,
    isBrowser = require('./utils').isBrowser,
    isEqualObjects = require('./utils').isEqualObjects,
    UIComponent = require('./ui/ui_component').UIComponent,
    AppHeaderBar = require('./components/app_header_bar').AppHeaderBar,
    AppFooterBar = require('./components/app_footer_bar').AppFooterBar,
    SettingsContainer = require('./components/settings_container').SettingsContainer,
    UserInputContainer = require('./components/user_input_container').UserInputContainer,
    Chrome = require('./extension/chrome').Chrome,
    Opera = require('./extension/opera').Opera,
    Firefox = require('./extension/firefox').Firefox;

/**
 * @constructor
 */
var XTranslate = function (options) {
    XTranslate.superclass.constructor.call(this, options);

    /** @type {Google|Yandex|Bing} */
    this.vendor = undefined;

    if (isBrowser('chrome')) this.extension = new Chrome();
    if (isBrowser('opera')) this.extension = new Opera();
    if (isBrowser('firefox')) this.extension = new Firefox();
};

inherit(XTranslate, UIComponent);

XTranslate.prototype.run = function () {
    this.extension.loadState().done(this.onLoadState.bind(this));
};

/** @private */
XTranslate.prototype.createDom = function (state) {
    this.$container.addClass('XTranslate');

    this.headerBar = new AppHeaderBar({state: state['header']}).appendTo(this);
    this.settingsContainer = new SettingsContainer({state: state['settings']}).appendTo(this);
    this.userInputContainer = new UserInputContainer().appendTo(this);
    this.footerBar = new AppFooterBar().appendTo(this);

    this.headerBar.addTab(__(1), this.settingsContainer);
    this.headerBar.addTab(__(2), this.userInputContainer);
    this.headerBar.refresh();
};

/** @private */
XTranslate.prototype.bindEvents = function () {
    $(window).on('unload blur', this.saveState.bind(this));
};

/** @private */
XTranslate.prototype.onLoadState = function (state) {
    this.state = state || {};
    this.createDom(this.state);
    this.bindEvents();
    window.scrollTo(0, this.state['scroll'] || 0);
};

XTranslate.prototype.saveState = function () {
    var state = this.getState();
    var changed = !isEqualObjects(this.state, state);
    if (!changed || this.clearing) return;
    this.state = state;
    this.extension.saveState(state);
};

XTranslate.prototype.getState = function () {
    return {
        'header'  : this.headerBar.getState(),
        'settings': this.settingsContainer.getState(),
        'scroll'  : window.pageYOffset
    };
};

XTranslate.prototype.reset = function () {
    this.clearing = true;
    this.extension.removeState();
    location.reload(true);
};

/**
 * Method for sharing data between components.
 * Using with one argument works as a getter (similar to jQuery.data)
 * @param {string} name
 * @param [value]
 */
XTranslate.prototype.data = function (name, value) {
    if (!this.sharedData) this.sharedData = {};
    if (value === undefined) return this.sharedData[name];
    return (this.sharedData[name] = value);
};

exports.XTranslate = XTranslate;