'use strict';

var inherit = require('./../utils').inherit,
    UIComponent = require('./../ui/ui_component').UIComponent,
    AppHeaderBar = require('./app_header_bar').AppHeaderBar,
    AppFooterBar = require('./app_footer_bar').AppFooterBar,
    SettingsContainer = require('./settings_container').SettingsContainer,
    UserInputContainer = require('./user_input_container').UserInputContainer;

/**
 * @constructor
 */
var AppView = function (options) {
    AppView.superclass.constructor.call(this, options);
    this.$container.addClass('XTranslate');
};

inherit(AppView, UIComponent);

AppView.prototype.init = function (state) {
    this.headerBar = new AppHeaderBar({state: state.headerBar}).appendTo(this);
    this.settingsContainer = new SettingsContainer({state: state.settingsContainer}).appendTo(this);
    this.userInputContainer = new UserInputContainer().appendTo(this);
    this.footerBar = new AppFooterBar().appendTo(this);

    this.headerBar.addTab(__(1), this.settingsContainer);
    this.headerBar.addTab(__(2), this.userInputContainer);
    this.headerBar.refresh();
    return this;
};

exports.AppView = AppView;