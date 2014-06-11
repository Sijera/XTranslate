'use strict';

var UTILS = require('../utils'),
    THEME = require('../theme'),
    inherit = require('../utils').inherit,
    Popup = require('./popup').Popup,
    Button = require('../ui/button').Button,
    Select = require('../ui/select').Select,
    Slider = require('../ui/slider').Slider,
    TextInput = require('../ui/text_input').TextInput,
    NumberInput = require('../ui/number_input').NumberInput,
    CheckBox = require('../ui/check_box').CheckBox,
    ColorPicker = require('../ui/color_picker').ColorPicker,
    SettingsBlock = require('./settings_block').SettingsBlock;

/** @const */ var CSS_SAVING_THEME = 'saving';

/**
 * @constructor
 */
var SettingsThemeManager = function (options) {
    this.customThemeName = '--';
    SettingsThemeManager.superclass.constructor.call(this, options);

    this.setTitle(__(25));
    this.initPreviewIcon();
};

inherit(SettingsThemeManager, SettingsBlock);

/** @private */
SettingsThemeManager.prototype.initPreviewIcon = function () {
    var $previewIcon = $('<span class="togglePreviewIcon fa-picture-o">')
        .attr('title', __(73))
        .appendTo(this.$title);

    $previewIcon.on('click', function () {
        this.popup.toggle();
        $previewIcon.toggleClass('active', !this.popup.hidden);
    }.bind(this));

    // hide on tabs change
    APP.on('change:headerBar.activeTab', function () {
        var blockIsVisible = this.$container.is(':visible');
        var previewIsActive = $previewIcon.is('.active');
        this.popup.toggle(previewIsActive && blockIsVisible);
    }.bind(this));
};

/** @private */
SettingsThemeManager.prototype.createDom = function (state) {
    SettingsThemeManager.superclass.createDom.apply(this, arguments);
    this.$container.addClass('settingsThemeManager');

    /** @type {Popup} */
    this.popup = new Popup({className: 'preview', autoHide: false});
    this.popup.parseData({
        translation: __(22),
        ttsEnabled : true,
        dictionary : [{partOfSpeech: __(23), translation: __(24).split(', ')}]
    });

    this.addThemeBlock();
    this.addBackgroundStyle();
    this.addTextStyle();
    this.addBorderStyle();
    this.addCommonStyle();

    this.theme.setValue(state.activeTheme || this.customThemeName, true);
    this.applyTheme();
};

/** @private */
SettingsThemeManager.prototype.bindEvents = function () {
    SettingsThemeManager.superclass.bindEvents.apply(this, arguments);

    this.bindChangeStyle(
        // background
        this.bgColor1,
        this.bgColor2,
        this.bgcLinear,
        this.bgcOpacity,

        // border
        this.borderRadius,
        this.borderOpacity,
        this.borderColor,
        this.borderStyle,
        this.borderWidth,

        // text
        this.fontFamily,
        this.fontSize,
        this.textColor,
        this.textShadowColor,
        this.textShadowOffsetX,
        this.textShadowOffsetY,
        this.textShadowBlurRadius,

        // common
        this.boxMaxWidth,
        this.boxMaxHeight,
        this.boxPadding,
        this.boxShadowColor,
        this.boxShadowSize,
        this.boxShadowOpacity,
        this.boxShadowInner
    );
};

/**
 * Bind change-event for all ui components, provided in the arguments
 * @private
 * @param {...FormControl|*} components
 */
SettingsThemeManager.prototype.bindChangeStyle = function (components) {
    components = $.makeArray(arguments);
    components.forEach(function (component) {
        component.on('change', this.onChangeStyle, this);
    }, this);
};

/** @private */
SettingsThemeManager.prototype.onChangeStyle = function () {
    this.setCustomTheme();
};

/**
 * Create a block of styles
 * @param {String} [name] A name or title for the block
 * @param {String} [className]
 * @returns {*|jQuery|HTMLElement}
 */
SettingsThemeManager.prototype.createBlock = function (name, className) {
    var $block = $('<div class="block"/>').addClass(className).appendTo(this.$content);
    if (name) $block.append('<span class="name">' + name + '</span>');
    return $block;
};

/**
 * Create a sub-block inside block of styles
 * @param {String} title
 * @param {jQuery|HTMLElement|*} [parentBlock]
 * @param {Boolean} [returnBlock]
 * @returns {*|jQuery}
 */
SettingsThemeManager.prototype.createSubBlock = function (title, parentBlock, returnBlock) {
    var $subBlock = $('<div class="subBlock"/>')
        .append('<div class="param"><span>' + (title || '') + '</span></div>')
        .append('<div class="data"/>')
        .appendTo(parentBlock);
    return returnBlock ? $subBlock : $subBlock.find('.data');
};

/** @private */
SettingsThemeManager.prototype.addThemeBlock = function () {
    this.$themeBlock = this.createBlock('', 'themeBlock');
    var $actionButtons = $('<div class="actionButtons"/>').appendTo(this.$themeBlock);

    /** @type {Select} */
    this.theme = new Select({className: 'themeSelect', removable: true})
        .on('change', this.onChangeTheme, this)
        .on('remove', this.onRemoveTheme, this)
        .appendTo(this.$themeBlock);

    /** @type {TextInput} */
    this.themeName = new TextInput({
        className   : 'themeName',
        title       : __(12),
        tooltip     : '{0}',
        noBodyAppend: false,
        validation  : this.themeNameValidator.bind(this)
    }).appendTo(this.$themeBlock);

    this.themeName.on('keyenter', this.onSaveTheme, this);

    /** @type {Button} */
    this.saveTheme = new Button({className: 'saveTheme fa-save', title: __(28)})
        .on('click', this.saveTheme, this)
        .appendTo($actionButtons);

    /** @type {Button} */
    this.cancelSave = new Button({className: 'cancelSave fa-times-circle', title: __(26)})
        .on('click', this.cancelSaving, this)
        .appendTo($actionButtons);

    var themes = this.state.themes;
    Object.keys(themes).forEach(function (name) {
        this.addTheme(name, themes[name], true);
    }, this);
};

/** @private */
SettingsThemeManager.prototype.addCommonStyle = function () {
    var $common = this.createBlock(__(30), 'commonBlock');
    var $padding = this.createSubBlock(__(51), $common);
    var $maxWidth = this.createSubBlock(__(52), $common);
    var $maxHeight = this.createSubBlock(__(53), $common);
    var $boxShadow = this.createSubBlock(__(50), $common);

    /** @type {Slider} */      this.boxPadding = new Slider({min: 0, max: 5, step: 0.1}).appendTo($padding);
    /** @type {Slider} */      this.boxMaxWidth = new Slider({min: 0, max: 500, step: 1}).appendTo($maxWidth);
    /** @type {Slider} */      this.boxMaxHeight = new Slider({min: 0, max: 500, step: 1}).appendTo($maxHeight);
    /** @type {ColorPicker} */ this.boxShadowColor = new ColorPicker({useInput: true, title: __(36), titleHint: __(59)}).appendTo($boxShadow);
    /** @type {NumberInput} */ this.boxShadowSize = new NumberInput({minValue: 0, maxValue: 100, title: __(41)}).appendTo($boxShadow);
    /** @type {NumberInput} */ this.boxShadowOpacity = new NumberInput({minValue: 0, maxValue: 100, title: __(37)}).appendTo($boxShadow);
    /** @type {CheckBox} */    this.boxShadowInner = new CheckBox({label: __(43)}).appendTo($boxShadow);
};

/** @private */
SettingsThemeManager.prototype.addBackgroundStyle = function () {
    var $background = this.createBlock(__(31), 'bgcBlock');
    var $bgColor = this.createSubBlock(__(36), $background);
    var $opacity = this.createSubBlock(__(37), $background);

    /** @type {ColorPicker} */ this.bgColor1 = new ColorPicker({useInput: true, titleHint: __(59)}).appendTo($bgColor);
    /** @type {ColorPicker} */ this.bgColor2 = new ColorPicker({useInput: true, titleHint: __(59)}).appendTo($bgColor);
    /** @type {CheckBox} */    this.bgcLinear = new CheckBox({label: __(38)}).appendTo($bgColor);
    /** @type {Slider} */      this.bgcOpacity = new Slider({min: 0, max: 100}).appendTo($opacity);

    this.bgcLinear.on('change', this.bgColor2.toggle.bind(this.bgColor2));
};

/** @private */
SettingsThemeManager.prototype.addBorderStyle = function () {
    var $border = this.createBlock(__(32), 'borderBlock');
    var $radius = this.createSubBlock(__(40), $border);
    var $opacity = this.createSubBlock(__(37), $border);
    var $style = this.createSubBlock(__(54), $border);

    /** @type {Slider} */      this.borderRadius = new Slider({min: 0, max: 25, step: 1}).appendTo($radius);
    /** @type {Slider} */      this.borderOpacity = new Slider({min: 0, max: 100}).appendTo($opacity);
    /** @type {ColorPicker} */ this.borderColor = new ColorPicker({useInput: true, title: __(36), titleHint: __(59)}).appendTo($style);
    /** @type {Select} */      this.borderStyle = new Select({className: 'borderStyle', title: __(54)}).appendTo($style);
    /** @type {NumberInput} */ this.borderWidth = new NumberInput({minValue: 0, maxValue: 25, title: __(39)}).appendTo($style);

    THEME.BORDER_STYLES.forEach(function (style) {
        this.borderStyle.add(style, true);
    }, this);
};

/** @private */
SettingsThemeManager.prototype.addTextStyle = function () {
    var $text = this.createBlock(__(33), 'textBlock');
    var $font = this.createSubBlock(__(42), $text);
    var $color = this.createSubBlock(__(36), $text);
    var $shadow = this.createSubBlock(__(50), $text).addClass('textShadow');

    /** @type {Select} */      this.fontFamily = new Select({className: 'fontFamily'}).appendTo($font);
    /** @type {NumberInput} */ this.fontSize = new NumberInput({minValue: 0, maxValue: 50, title: __(41)}).appendTo($font);
    /** @type {ColorPicker} */ this.textColor = new ColorPicker({useInput: true, title: __(33), titleHint: __(59)}).appendTo($color);
    /** @type {ColorPicker} */ this.textShadowColor = new ColorPicker({useInput: true, title: __(50), titleHint: __(59)}).appendTo($color);
    /** @type {NumberInput} */ this.textShadowOffsetX = new NumberInput({value: 0, title: __(57) + ' X'}).appendTo($shadow);
    /** @type {NumberInput} */ this.textShadowOffsetY = new NumberInput({value: 0, title: __(57) + ' Y'}).appendTo($shadow);
    /** @type {NumberInput} */ this.textShadowBlurRadius = new NumberInput({value: 0, title: __(56), maxValue: 1000}).appendTo($shadow);

    THEME.FONTS.forEach(function (fontFamily) {
        this.fontFamily.add(fontFamily, true);
    }, this);
};

/** @private */
SettingsThemeManager.prototype.createTheme = function () {
    return {
        bgColor1         : this.bgColor1.getValue(),
        bgColor2         : this.bgColor2.getValue(),
        bgcLinear        : this.bgcLinear.getValue(),
        bgcOpacity       : this.bgcOpacity.getValue(),
        borderColor      : this.borderColor.getValue(),
        borderStyle      : this.borderStyle.getValue(),
        borderWidth      : this.borderWidth.getValue(),
        borderRadius     : this.borderRadius.getValue(),
        borderOpacity    : this.borderOpacity.getValue(),
        textColor        : this.textColor.getValue(),
        fontFamily       : this.fontFamily.getValue(),
        fontSize         : this.fontSize.getValue(),
        textShadowOffsetX: this.textShadowOffsetX.getValue(),
        textShadowOffsetY: this.textShadowOffsetY.getValue(),
        textShadowBlur   : this.textShadowBlurRadius.getValue(),
        textShadowColor  : this.textShadowColor.getValue(),
        padding          : this.boxPadding.getValue(),
        maxWidth         : this.boxMaxWidth.getValue(),
        maxHeight        : this.boxMaxHeight.getValue(),
        boxShadowColor   : this.boxShadowColor.getValue(),
        boxShadowSize    : this.boxShadowSize.getValue(),
        boxShadowOpacity : this.boxShadowOpacity.getValue(),
        boxShadowInner   : this.boxShadowInner.getValue()
    }
};

/** @private */
SettingsThemeManager.prototype.applyTheme = function (theme) {
    theme = this.popup.applyTheme(theme);
    if (!theme) return;

    this.bgColor1.setValue(theme.bgColor1, true);
    this.bgColor2.setValue(theme.bgColor2, true);
    this.bgColor2.toggle(theme.bgcLinear);
    this.bgcLinear.setValue(theme.bgcLinear, true);
    this.bgcOpacity.setValue(theme.bgcOpacity, true);

    this.borderColor.setValue(theme.borderColor, true);
    this.borderStyle.setValue(theme.borderStyle, true);
    this.borderWidth.setValue(theme.borderWidth);
    this.borderRadius.setValue(theme.borderRadius, true);
    this.borderOpacity.setValue(theme.borderOpacity, true);

    this.textColor.setValue(theme.textColor, true);
    this.fontFamily.setValue(theme.fontFamily, true);
    this.fontSize.setValue(theme.fontSize);
    this.textShadowOffsetX.setValue(theme.textShadowOffsetX);
    this.textShadowOffsetY.setValue(theme.textShadowOffsetY);
    this.textShadowBlurRadius.setValue(theme.textShadowBlur);
    this.textShadowColor.setValue(theme.textShadowColor, true);

    this.boxPadding.setValue(theme.padding, true);
    this.boxMaxWidth.setValue(theme.maxWidth, true);
    this.boxMaxHeight.setValue(theme.maxHeight, true);
    this.boxShadowColor.setValue(theme.boxShadowColor, true);
    this.boxShadowSize.setValue(theme.boxShadowSize);
    this.boxShadowOpacity.setValue(theme.boxShadowOpacity);
    this.boxShadowInner.setValue(theme.boxShadowInner, true);
};

SettingsThemeManager.prototype.saveTheme = function () {
    this.$themeBlock.addClass(CSS_SAVING_THEME);
    this.themeName.$input.focus();
};

SettingsThemeManager.prototype.cancelSaving = function () {
    this.$themeBlock.removeClass(CSS_SAVING_THEME);
    this.themeName.value = '';
    this.themeName.valid = true;
    this.themeName.inputted = false;
};

SettingsThemeManager.prototype.setCustomTheme = function () {
    if (this.state.activeTheme) {
        this.state.activeTheme = null;
        this.theme.setValue(this.customThemeName, true);
    }
    this.state.customTheme = this.createTheme();
    this.applyTheme();
};

/** @private */
SettingsThemeManager.prototype.onChangeTheme = function (themeName) {
    this.state.activeTheme = themeName;
    this.state.customTheme = null;
    this.applyTheme();
};

/** @private */
SettingsThemeManager.prototype.onSaveTheme = function (e) {
    var themeName = this.themeName.value.trim();
    if (!themeName || !this.themeName.valid) return;
    this.cancelSaving();
    this.addTheme(themeName);
    this.theme.selectByValue(themeName);
};

/** @private */
SettingsThemeManager.prototype.addTheme = function (name, theme, silent) {
    theme = theme || this.createTheme();
    this.theme.add({title: name, value: name, data: theme, removeTitle: __(29)}, silent);
    this.modifyTheme(name, theme, silent);
};

/** @private */
SettingsThemeManager.prototype.onRemoveTheme = function (itemObj) {
    var themeName = itemObj.value;
    if (itemObj.selected) this.setCustomTheme();
    this.modifyTheme(themeName, null);
};

/** @private */
SettingsThemeManager.prototype.modifyTheme = function (name, theme, silent) {
    var themes = silent ? this.state.themes : $.extend({}, this.state.themes);
    if (theme) themes[name] = theme;
    if (!theme) delete themes[name];
    this.state.themes = themes;
};

/** @private */
SettingsThemeManager.prototype.themeNameValidator = function (value, validObj) {
    value = value.trim();
    var tooltip = '';
    var emptyName = !value;
    var themeExists = this.state.themes[value];
    var reservedName = value == this.customThemeName;

    if (emptyName) tooltip = __(13);
    if (reservedName) tooltip = __(27);
    if (themeExists) tooltip = __(11, ['&laquo;' + value + '&raquo;']);
    if (tooltip) validObj.tooltipData = tooltip;

    return !tooltip;
};

exports.SettingsThemeManager = SettingsThemeManager;