'use strict';

var inherit = require('../utils').inherit,
    UIComponent = require('../ui/ui_component').UIComponent,
    SettingsDisplayOptions = require('./settings_display_options').SettingsDisplayOptions,
    SettingsVendor = require('./settings_vendor').SettingsVendor,
    SettingsThemeManager = require('./settings_theme_manager').SettingsThemeManager,
    SettingsExclusions = require('./settings_exclusions').SettingsExclusions;

/**
 * @constructor
 */
var SettingsContainer = function (options) {
    SettingsContainer.superclass.constructor.call(this, options);

    var state = this.state;
    this.$container.addClass('settingsContainer');
    new SettingsDisplayOptions({state: state.popupDefinitions}).appendTo(this);
    new SettingsVendor({state: state.vendorBlock}).appendTo(this);
    new SettingsThemeManager({state: state.popupStyle}).appendTo(this);
    new SettingsExclusions({state: state.siteExclusions}).appendTo(this);
};

inherit(SettingsContainer, UIComponent);

exports.SettingsContainer = SettingsContainer;