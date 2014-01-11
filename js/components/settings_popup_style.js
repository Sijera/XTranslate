'use strict';

var UTILS = require('../utils'),
    inherit = UTILS.inherit,
    hex2Rgba = UTILS.hex2Rgba,
    Popup = require('./popup').Popup,
    Button = require('../ui/button').Button,
    Select = require('../ui/select').Select,
    Slider = require('../ui/slider').Slider,
    TextInput = require('../ui/text_input').TextInput,
    NumberInput = require('../ui/number_input').NumberInput,
    CheckBox = require('../ui/check_box').CheckBox,
    ColorPicker = require('../ui/color_picker').ColorPicker,
    SettingsBlock = require('./settings_block').SettingsBlock;

/** @const */ var STATE_SAVING_THEME = 'saving';

/**
 * @constructor
 */
var SettingsPopupStyle = function (options) {
    this.popupDemoText = {
        translation: __(22),
        dictionary : [[__(23), __(24).split(', ')]]
    };

    SettingsPopupStyle.superclass.constructor.call(this, options);
    this.setTitle(__(5));
};

inherit(SettingsPopupStyle, SettingsBlock);

/** @private */
SettingsPopupStyle.prototype.createDom = function (state) {
    SettingsPopupStyle.superclass.createDom.apply(this, arguments);
    this.$container.addClass('settingsPopupStyle');

    this.themes = state['themes'] || CSS_THEMES;
    this.customTheme = state['customTheme'];
    this.customThemeName = '--';
    this.activeTheme = this.customTheme ? undefined : (state['activeTheme'] || Object.keys(this.themes)[0]);

    this.$popupPreview = $('<div class="popupPreview"/>').appendTo(this.$content);
    this.popup = new Popup().parseData(this.popupDemoText).appendTo(this.$popupPreview);
    this.popup.$container.show();

    this.addThemeBlock();
    this.addBackgroundStyle();
    this.addTextStyle();
    this.addBorderStyle();
    this.addCommonStyle();

    this.theme.setValue(this.activeTheme || this.customThemeName, true);
    this.applyTheme();
};

/** @private */
SettingsPopupStyle.prototype.bindEvents = function () {
    SettingsPopupStyle.superclass.bindEvents.apply(this, arguments);

    this.bindChangeStyle(
        // background
        this.bgcMain,
        this.bgcSec,
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
        this.boxPadding,
        this.boxShadowColor,
        this.boxShadowSize,
        this.boxShadowOpacity,
        this.boxShadowInner
    );
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

    Object.keys(this.themes).forEach(function (themeName) {
        var theme = this.themes[themeName];
        this.addTheme(themeName, theme);
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

    /** @type {ColorPicker} */ this.bgcMain = new ColorPicker({useInput: true, titleHint: __(59)}).appendTo($bgColor);
    /** @type {ColorPicker} */ this.bgcSec = new ColorPicker({useInput: true, titleHint: __(59)}).appendTo($bgColor);
    /** @type {CheckBox} */ this.bgcLinear = new CheckBox({label: __(38)}).appendTo($bgColor);
    /** @type {Slider} */ this.bgcOpacity = new Slider({min: 0, max: 100}).appendTo($opacity);
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

    BORDER_STYLES.forEach(function (style) {
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

    FONTS.forEach(function (fontFamily) {
        this.fontFamily.add(fontFamily, true);
    }, this);
};

/** @protected */
SettingsPopupStyle.prototype.convertToCSS = function (theme) {
    // background
    var bgcMain = theme.background.color[0],
        bgcSec = theme.background.color[1],
        bgcOpacity = theme.background.opacity / 100;

    if (bgcOpacity < 1) {
        bgcMain = hex2Rgba(bgcMain, bgcOpacity);
        bgcSec = hex2Rgba(bgcSec, bgcOpacity);
    }
    if (theme.background.linear) {
        bgcMain = UTILS.sprintf('linear-gradient(180deg, {0}, {1})', bgcMain, bgcSec);
    }

    // border
    var borderOpacity = theme.border.opacity / 100;
    var borderColor = borderOpacity < 1 ? hex2Rgba(theme.border.color, borderOpacity) : theme.border.color;
    var border = [theme.border.width + 'px', theme.border.style, borderColor].join(' ');
    var borderRadius = theme.border.radius + 'px';

    // text
    var fontFamily = theme.text.font;
    var fontSize = theme.text.size + 'px';
    var textColor = theme.text.color;
    var textShadowX = theme.text.shadow.offset[0];
    var textShadowY = theme.text.shadow.offset[1];
    var textShadowBlur = theme.text.shadow.blur;
    var textShadow = [textShadowX + 'px', textShadowY + 'px', textShadowBlur + 'px', theme.text.shadow.color].join(' ');
    if (!textShadowX && !textShadowY && !textShadowBlur) textShadow = 'none';

    // box
    var maxWidth = theme.box.maxWidth ? theme.box.maxWidth : 'none';
    var maxHeight = theme.box.maxHeight ? theme.box.maxHeight : 'none';
    var padding = theme.box.padding + 'em';
    var boxShadowOpacity = theme.box.shadow.opacity / 100;
    var boxShadowColor = boxShadowOpacity < 1 ? hex2Rgba(theme.box.shadow.color, boxShadowOpacity) : theme.box.shadow.color;
    var boxShadow = [theme.box.shadow.inner ? 'inset' : '', 0, 0, theme.box.shadow.size + 'px', boxShadowColor].join(' ');

    return {
        maxWidth    : maxWidth,
        maxHeight   : maxHeight,
        padding     : padding,
        background  : bgcMain,
        border      : border,
        borderRadius: borderRadius,
        fontFamily  : fontFamily,
        fontSize    : fontSize,
        color       : textColor,
        textShadow  : textShadow,
        boxShadow   : boxShadow
    };
};

/** @private */
SettingsPopupStyle.prototype.createTheme = function () {
    return {
        "background": {
            "color"  : [this.bgcMain.getValue(), this.bgcSec.getValue()],
            "linear" : this.bgcLinear.getValue(),
            "opacity": this.bgcOpacity.getValue()
        },
        "border": {
            "color"  : this.borderColor.getValue(),
            "style"  : this.borderStyle.getValue(),
            "width"  : this.borderWidth.getValue(),
            "radius" : this.borderRadius.getValue(),
            "opacity": this.borderOpacity.getValue()
        },
        "text": {
            "color" : this.textColor.getValue(),
            "font"  : this.fontFamily.getValue(),
            "size"  : this.fontSize.getValue(),
            "shadow": {
                "offset": [this.textShadowOffsetX.getValue(), this.textShadowOffsetY.getValue()],
                "blur"  : this.textShadowBlurRadius.getValue(),
                "color" : this.textShadowColor.getValue()
            }
        },
        "box": {
            "padding"  : this.boxPadding.getValue(),
            "maxWidth" : this.boxMaxWidth.getValue(),
            "maxHeight": this.boxMaxHeight.getValue(),
            "shadow": {
                "color"  : this.boxShadowColor.getValue(),
                "size"   : this.boxShadowSize.getValue(),
                "opacity": this.boxShadowOpacity.getValue(),
                "inner"  : this.boxShadowInner.getValue()
            }
        }
    };
};

/** @private */
SettingsPopupStyle.prototype.applyTheme = function (theme) {
    theme = theme || this.getTheme();
    if (!theme) return;

    this.popup.$container.css(this.convertToCSS(theme));

    this.bgcMain.setValue(theme.background.color[0], true);
    this.bgcSec.setValue(theme.background.color[1], true);
    this.bgcLinear.setValue(theme.background.linear, true);
    this.bgcOpacity.setValue(theme.background.opacity, true);

    this.borderColor.setValue(theme.border.color, true);
    this.borderStyle.setValue(theme.border.style, true);
    this.borderWidth.setValue(theme.border.width);
    this.borderRadius.setValue(theme.border.radius, true);
    this.borderOpacity.setValue(theme.border.opacity, true);

    this.textColor.setValue(theme.text.color, true);
    this.fontFamily.setValue(theme.text.font, true);
    this.fontSize.setValue(theme.text.size);
    this.textShadowOffsetX.setValue(theme.text.shadow.offset[0]);
    this.textShadowOffsetY.setValue(theme.text.shadow.offset[1]);
    this.textShadowBlurRadius.setValue(theme.text.shadow.blur);
    this.textShadowColor.setValue(theme.text.shadow.color, true);

    this.boxPadding.setValue(theme.box.padding, true);
    this.boxMaxWidth.setValue(theme.box.maxWidth, true);
    this.boxMaxHeight.setValue(theme.box.maxHeight, true);
    this.boxShadowColor.setValue(theme.box.shadow.color, true);
    this.boxShadowSize.setValue(theme.box.shadow.size);
    this.boxShadowOpacity.setValue(theme.box.shadow.opacity);
    this.boxShadowInner.setValue(theme.box.shadow.inner, true);
};

/**
 * Bind "change"-event for all components provided in arguments
 * @private
 * @param {...Object} components A list of {FormControl} components with available event
 */
SettingsPopupStyle.prototype.bindChangeStyle = function (components) {
    components = $.makeArray(arguments);
    components.forEach(function (component) {
        component.on('change', this.onChangeStyle, this);
    }, this);
};

SettingsPopupStyle.prototype.saveTheme = function () {
    this.$themeBlock.addClass(STATE_SAVING_THEME);
    this.themeName.$input.focus();
};

SettingsPopupStyle.prototype.cancelSaving = function () {
    this.$themeBlock.removeClass(STATE_SAVING_THEME);
    this.themeName.value = '';
    this.themeName.valid = true;
    this.themeName.inputted = false;
};

SettingsPopupStyle.prototype.setCustomTheme = function () {
    if (this.activeTheme) this.theme.setValue(this.customThemeName);
    this.customTheme = this.createTheme();
    this.applyTheme();
    delete this.activeTheme;
};

SettingsPopupStyle.prototype.getTheme = function (themeName) {
    themeName = themeName || this.activeTheme;
    return this.themes[themeName] || this.customTheme;
};

/** @private */
SettingsPopupStyle.prototype.onChangeStyle = function () {
    this.setCustomTheme();
};

/** @private */
SettingsPopupStyle.prototype.onChangeTheme = function (themeName) {
    var theme = this.theme.getData();
    this.activeTheme = theme ? themeName : undefined;
    this.applyTheme();
    delete this.customTheme;
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
    delete this.themes[themeName];
};

/** @private */
SettingsPopupStyle.prototype.themeNameValidator = function (value, validObj) {
    value = value.trim();
    var tooltip = '';
    var emptyName = !value;
    var themeExists = this.themes[value];
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

    this.themes[themeName] = theme;
    this.theme.add({
        title      : themeName,
        value      : themeName,
        data       : theme,
        removeTitle: __(29)
    }, true);
};

SettingsPopupStyle.prototype.getState = function () {
    var state = SettingsPopupStyle.superclass.getState.apply(this, arguments);
    return $.extend(state, {
        'activeTheme': this.activeTheme,
        'customTheme': this.customTheme,
        'themes'     : this.themes
    });
};

/** @const */
var BORDER_STYLES = ["solid", "dotted", "dashed", "double", "groove", "ridge", "inset", "outset"];

/** @const */
var FONTS = [
    "Arial",
    "Tahoma",
    "Verdana",
    "Trebuchet MS",
    "Myriad Pro",
    "Courier New",
    "Times New Roman",
    "Meiryo UI",
    "Hiragino Kaku Gothic Pro",
    "MS UI Gothic",
    "VL Gothic"
];

/** @const */
var CSS_THEMES = {
    "Dark warrior": {
        "background": {
            "color"  : ["#000000", "#7f7f7f"],
            "linear" : true,
            "opacity": 80
        },
        "border"    : {
            "color"  : "#000000",
            "style"  : "solid",
            "width"  : 1,
            "radius" : 5,
            "opacity": 100
        },
        "text"      : {
            "color" : "#ffffff",
            "font"  : "Verdana",
            "size"  : 13,
            "shadow": {"offset": [1, 1], "blur": 0, "color": "#000000"}
        },
        "box"       : {
            "padding"  : 1,
            "maxWidth" : 300,
            "maxHeight": 200,
            "shadow"   : {
                "color"  : "#ffffff",
                "size"   : 10,
                "opacity": 100,
                "inner"  : true
            }
        }
    },

    "Light breath": {
        "background": {
            "color"  : ["#ffffff", "#7f7f7f"],
            "linear" : false,
            "opacity": 95
        },
        "border"    : {
            "color"  : "#000000",
            "style"  : "solid",
            "width"  : 1,
            "radius" : 5,
            "opacity": 0
        },
        "text"      : {
            "color" : "#000000",
            "font"  : "Verdana",
            "size"  : 13,
            "shadow": {"offset": [0, 0], "blur": 0, "color": "#000000"}
        },
        "box"       : {
            "padding"  : 0.8,
            "maxWidth" : 300,
            "maxHeight": 200,
            "shadow"   : {
                "color"  : "#000000",
                "size"   : 11,
                "opacity": 50,
                "inner"  : false
            }
        }
    }
};

exports.SettingsPopupStyle = SettingsPopupStyle;