'use strict';

var inherit = require('./../utils').inherit,
    UIComponent = require('./../ui/ui_component').UIComponent,
    AppHeaderBar = require('./app_header_bar').AppHeaderBar,
    AppFooterBar = require('./app_footer_bar').AppFooterBar,
    SettingsContainer = require('./settings_container').SettingsContainer,
    UserInputContainer = require('./user_input_container').UserInputContainer;

/**
 * @constructor
 * @property {App} model
 */
var AppView = function (options) {
    AppView.superclass.constructor.call(this, options);
};

inherit(AppView, UIComponent);

AppView.prototype.init = function (appModel) {
    this.model = appModel;
    this.createDom(appModel.state);
    this.bindEvents();
};

/** @private */
AppView.prototype.createDom = function (state) {
    this.$container.addClass('XTranslate');

    this.headerBar = new AppHeaderBar({state: state.headerBar}).appendTo(this);
    this.settingsContainer = new SettingsContainer({state: state.settingsContainer}).appendTo(this);
    this.userInputContainer = new UserInputContainer({state: state.settingsContainer.vendorBlock}).appendTo(this);
    this.footerBar = new AppFooterBar().appendTo(this);

    this.headerBar.addTab(__(1), this.settingsContainer);
    this.headerBar.addTab(__(2), this.userInputContainer);
    this.headerBar.refresh();
};

/** @private */
AppView.prototype.bindEvents = function () {
    $(window).on('unload', this.onUnload.bind(this));
};

/** @private */
AppView.prototype.onUnload = function () {
    this.model.sync();
};

exports.AppView = AppView;