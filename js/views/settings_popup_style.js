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
var SettingsPopupStyle = function (options) {
    this.customThemeName = '--';

    this.popupPreviewData = {
        translation: __(22),
        dictionary : [{partOfSpeech: __(23), translation: __(24).split(', ')}]
    };
    SettingsPopupStyle.superclass.constructor.call(this, options);
    this.setTitle(__(5));
};

inherit(SettingsPopupStyle, SettingsBlock);

/** @private */
SettingsPopupStyle.prototype.createDom = function (state) {
    SettingsPopupStyle.superclass.createDom.apply(this, arguments);
    this.$container.addClass('settingsPopupStyle');

    /** @type {jQuery} */ this.$popupPreview = $('<div class="popupPreview"/>').appendTo(this.$content);
    /** @type {Popup} */ this.popup = new Popup().parseData(this.popupPreviewData).appendTo(this.$popupPreview);
    this.popup.$container.show();

    this.addThemeBlock();
    this.addBackgroundStyle();
    this.addTextStyle();
    this.addBorderStyle();
    this.addCommonStyle();

    this.theme.setValue(state.activeTheme || this.customThemeName, true);
    this.applyTheme();
};

/** @private */
SettingsPopupStyle.prototype.bindEvents = function () {
    SettingsPopupStyle.superclass.bindEvents.apply(this, arguments);

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
SettingsPopupStyle.prototype.bindChangeStyle = function (components) {
    components = $.makeArray(arguments);
    components.forEach(function (component) {
        component.on('change', this.onChangeStyle, this);
    }, this);
};

/** @private */
SettingsPopupStyle.prototype.onChangeStyle = function () {
    this.setCustomTheme();
};

/**
 * Create a block of styles
 * @param {String} [name] A name or title for the block
 * @param {String} [className]
 * @returns {*|jQuery|HTMLElement}
 */
SettingsPopupStyle.prototype.createBlock = function (name, className) {
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
SettingsPopupStyle.prototype.createSubBlock = function (title, parentBlock, returnBlock) {
    var $subBlock = $('<div class="subBlock"/>')
        .append('<div class="param"><span>' + (title || '') + '</span></div>')
        .append('<div class="data"/>')
        .appendTo(parentBlock);
    return returnBlock ? $subBlock : $subBlock.find('.data');
};

/** @private */
SettingsPopupStyle.prototype.addThemeBlock = function () {
    this.$themeBlock = this.createBlock(__(25), 'themeBlock');
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
    this.saveTheme = new Button({className: 'saveTheme', title: __(28)})
        .on('click', this.saveTheme, this)
        .appendTo($actionButtons);

    /** @type {Button} */
    this.cancelSave = new Button({className: 'cancelSave', title: __(26)})
        .on('click', this.cancelSaving, this)
        .appendTo($actionButtons);

    var themes = this.state.themes;
    Object.keys(themes).forEach(function (name) {
        this.addTheme(name, themes[name]);
    }, this);
};

/** @private */
SettingsPopupStyle.prototype.addCommonStyle = function () {
    var $common = this.createBlock(__(30), 'commonBlock');
    var $padding = this.createSubBlock(__(51), $common);
    var $maxWidth = this.createSubBlock(__(52), $common);
    var $maxHeight = this.createSubBlock(__(53), $common);
    var $boxShadow = this.createSubBlock(__(50), $common);

    /** @type {Slider} */ this.boxPadding = new Slider({min: 0, max: 5, step: 0.1, suffix: 'em'}).appendTo($padding);
    /** @type {Slider} */ this.boxMaxWidth = new Slider({min: 0, max: 500, step: 1, suffix: 'px'}).appendTo($maxWidth);
    /** @type {Slider} */ this.boxMaxHeight = new Slider({min: 0, max: 500, step: 1, suffix: 'px'}).appendTo($maxHeight);
    /** @type {ColorPicker} */ this.boxShadowColor = new ColorPicker({useInput: true, title: __(36), titleHint: __(59)}).appendTo($boxShadow);
    /** @type {NumberInput} */ this.boxShadowSize = new NumberInput({minValue: 0, maxValue: 100, title: __(41)}).appendTo($boxShadow);
    /** @type {NumberInput} */ this.boxShadowOpacity = new NumberInput({minValue: 0, maxValue: 100, title: __(37)}).appendTo($boxShadow);
    /** @type {CheckBox} */ this.boxShadowInner = new CheckBox({label: __(43)}).appendTo($boxShadow);
};

/** @private */
SettingsPopupStyle.prototype.addBackgroundStyle = function () {
    var $background = this.createBlock(__(31), 'bgcBlock');
    var $bgColor = this.createSubBlock(__(36), $background);
    var $opacity = this.createSubBlock(__(37), $background);

    /** @type {ColorPicker} */ this.bgColor1 = new ColorPicker({useInput: true, titleHint: __(59)}).appendTo($bgColor);
    /** @type {ColorPicker} */ this.bgColor2 = new ColorPicker({useInput: true, titleHint: __(59)}).appendTo($bgColor);
    /** @type {CheckBox} */ this.bgcLinear = new CheckBox({label: __(38)}).appendTo($bgColor);
    /** @type {Slider} */ this.bgcOpacity = new Slider({min: 0, max: 100}).appendTo($opacity);

    this.bgcLinear.on('change', this.bgColor2.toggle.bind(this.bgColor2));
};

/** @private */
SettingsPopupStyle.prototype.addBorderStyle = function () {
    var $border = this.createBlock(__(32), 'borderBlock');
    var $radius = this.createSubBlock(__(40), $border);
    var $opacity = this.createSubBlock(__(37), $border);
    var $style = this.createSubBlock(__(54), $border);

    /** @type {Slider} */ this.borderRadius = new Slider({min: 0, max: 25, step: 1}).appendTo($radius);
    /** @type {Slider} */ this.borderOpacity = new Slider({min: 0, max: 100}).appendTo($opacity);
    /** @type {ColorPicker} */ this.borderColor = new ColorPicker({useInput: true, title: __(36), titleHint: __(59)}).appendTo($style);
    /** @type {Select} */ this.borderStyle = new Select({className: 'borderStyle', title: __(54)}).appendTo($style);
    /** @type {NumberInput} */ this.borderWidth = new NumberInput({minValue: 0, maxValue: 25, title: __(39)}).appendTo($style);

    THEME.BORDER_STYLES.forEach(function (style) {
        this.borderStyle.add(style, true);
    }, this);
};

/** @private */
SettingsPopupStyle.prototype.addTextStyle = function () {
    var $text = this.createBlock(__(55), 'textBlock');
    var $font = this.createSubBlock(__(42), $text);
    var $color = this.createSubBlock(__(36), $text);
    var $shadow = this.createSubBlock(__(50), $text).addClass('textShadow');

    /** @type {Select} */ this.fontFamily = new Select({className: 'fontFamily', title: __(58)}).appendTo($font);
    /** @type {NumberInput} */ this.fontSize = new NumberInput({minValue: 10, maxValue: 25, title: __(41)}).appendTo($font);
    /** @type {ColorPicker} */ this.textColor = new ColorPicker({useInput: true, title: __(55), titleHint: __(59)}).appendTo($color);
    /** @type {ColorPicker} */ this.textShadowColor = new ColorPicker({useInput: true, title: __(50), titleHint: __(59)}).appendTo($color);
    /** @type {NumberInput} */ this.textShadowOffsetX = new NumberInput({value: 0, title: __(57)}).appendTo($shadow);
    /** @type {NumberInput} */ this.textShadowOffsetY = new NumberInput({value: 0, title: __(57)}).appendTo($shadow);
    /** @type {NumberInput} */ this.textShadowBlurRadius = new NumberInput({value: 0, title: __(56)}).appendTo($shadow);

    this.textShadowOffsetX.$container.before('<b>X:</b>');
    this.textShadowOffsetY.$container.before('<b>Y:</b>');
    this.textShadowBlurRadius.$container.before('<b>R:</b>');

    THEME.FONTS.forEach(function (fontFamily) {
        this.fontFamily.add(fontFamily, true);
    }, this);
};

/** @private */
SettingsPopupStyle.prototype.createTheme = function () {
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
SettingsPopupStyle.prototype.applyTheme = function (theme) {
    var themes = this.state.themes,
        activeTheme = this.state.activeTheme,
        customTheme = this.state.customTheme;

    theme = theme || themes[activeTheme] || customTheme;
    if (!theme) return;
    this.popup.$container.css(THEME.toCSS(theme));

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

SettingsPopupStyle.prototype.saveTheme = function () {
    this.$themeBlock.addClass(CSS_SAVING_THEME);
    this.themeName.$input.focus();
};

SettingsPopupStyle.prototype.cancelSaving = function () {
    this.$themeBlock.removeClass(CSS_SAVING_THEME);
    this.themeName.value = '';
    this.themeName.valid = true;
    this.themeName.inputted = false;
};

SettingsPopupStyle.prototype.setCustomTheme = function () {
    if (this.state.activeTheme) {
        this.state.activeTheme = null;
        this.theme.setValue(this.customThemeName, true);
    }
    this.state.customTheme = this.createTheme();
    this.applyTheme();
};

/** @private */
SettingsPopupStyle.prototype.onChangeTheme = function (themeName) {
    this.state.activeTheme = themeName;
    this.state.customTheme = null;
    this.applyTheme();
};

/** @private */
SettingsPopupStyle.prototype.onSaveTheme = function (e) {
    var themeName = this.themeName.value.trim();
    if (!themeName || !this.themeName.valid) return;
    this.cancelSaving();
    this.addTheme(themeName);
    this.theme.selectByValue(themeName);
};

/** @private */
SettingsPopupStyle.prototype.onRemoveTheme = function (itemObj) {
    var themeName = itemObj.value;
    if (itemObj.selected) this.setCustomTheme();
    delete this.state.themes[themeName];
};

/** @private */
SettingsPopupStyle.prototype.themeNameValidator = function (value, validObj) {
    value = value.trim();
    var tooltip = '';
    var emptyName = !value;
    var themeExists = this.state.themes[value];
    var reservedName = value == this.customThemeName;

    if (emptyName) tooltip = __(13);
    if (reservedName) tooltip = __(27);
    if (themeExists) tooltip = UTILS.sprintf(__(11), '&laquo;' + value + '&raquo;');
    if (tooltip) validObj.tooltipData = tooltip;

    return !tooltip;
};

/** @private */
SettingsPopupStyle.prototype.addTheme = function (themeName, theme) {
    theme = theme || this.createTheme();

    this.state.themes[themeName] = theme;
    this.theme.add({
        title      : themeName,
        value      : themeName,
        data       : theme,
        removeTitle: __(29)
    }, true);
};

exports.SettingsPopupStyle = SettingsPopupStyle;