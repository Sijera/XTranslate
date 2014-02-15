'use strict';

var inherit = require('../utils').inherit,
    UIComponent = require('../ui/ui_component').UIComponent,
    SettingsPopupDefinitions = require('./settings_popup_definitions').SettingsPopupDefinitions,
    SettingsVendor = require('./settings_vendor').SettingsVendor,
    SettingsPopupStyle = require('./settings_popup_style').SettingsPopupStyle,
    SettingsExclusions = require('./settings_exclusions').SettingsExclusions;

/**
 * @constructor
 */
var SettingsContainer = function (options) {
    SettingsContainer.superclass.constructor.call(this, options);

    this.createDom(this.state);
};

inherit(SettingsContainer, UIComponent);

/** @private */
SettingsContainer.prototype.createDom = function (state) {
    this.$container.addClass('settingsContainer');

    new SettingsPopupDefinitions({state: state.popupDefinitions}).appendTo(this);
    new SettingsVendor({state: state.vendorBlock}).appendTo(this);
    new SettingsPopupStyle({state: state.popupStyle}).appendTo(this);
    new SettingsExclusions({state: state.siteExclusions}).appendTo(this);
};

exports.SettingsContainer = SettingsContainer;