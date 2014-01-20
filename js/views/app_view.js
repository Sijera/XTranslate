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
    this.createDom(this.model.state);
    this.bindEvents();
};

/** @private */
AppView.prototype.createDom = function (state) {
    this.$container.addClass('XTranslate');

    this.headerBar = new AppHeaderBar({state: state['header']}).appendTo(this);
//    this.settingsContainer = new SettingsContainer({state: state['settings']}).appendTo(this);
//    this.userInputContainer = new UserInputContainer().appendTo(this);
//    this.footerBar = new AppFooterBar().appendTo(this);

    this.headerBar.addTab(__(1)/*, this.settingsContainer*/);
    this.headerBar.addTab(__(2)/*, this.userInputContainer*/);
    this.headerBar.refresh();

    window.scrollTo(0, state['scroll']);
};

/** @private */
AppView.prototype.bindEvents = function () {
    $(window)
        .on('unload', this.onUnload.bind(this))
        .on('scroll', this.onScroll.bind(this));
};

/** @private */
AppView.prototype.onUnload = function () {
    this.model.sync();
};

/** @private */
AppView.prototype.onScroll = function () {
    this.model.set('scroll', window.pageYOffset);
};

exports.AppView = AppView;