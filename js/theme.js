'use strict';

var UTILS = require('./utils'),
    sprintf = UTILS.sprintf,
    hex2Rgba = UTILS.hex2Rgba;

/** @const */
var CSS_THEMES = {
    "Dark warrior": {
        bgColor1         : '#000000',
        bgColor2         : '#7f7f7f',
        bgcLinear        : true,
        bgcOpacity       : 90,
        borderColor      : '#000000',
        borderStyle      : 'solid',
        borderWidth      : 1,
        borderRadius     : 5,
        borderOpacity    : 100,
        textColor        : '#ffffff',
        fontFamily       : 'Verdana',
        fontSize         : 0, // px, 0 = initial (browser default)
        textShadowOffsetX: 1,
        textShadowOffsetY: 1,
        textShadowBlur   : 0,
        textShadowColor  : '#000000',
        padding          : .7, // em
        maxWidth         : 300,
        maxHeight        : 250,
        boxShadowColor   : '#ffffff',
        boxShadowSize    : 10,
        boxShadowOpacity : 100,
        boxShadowInner   : true
    },

    "Light breath": {
        bgColor1         : '#ffffff',
        bgColor2         : 'black',
        bgcLinear        : false,
        bgcOpacity       : 95,
        borderColor      : '#000000',
        borderStyle      : 'solid',
        borderWidth      : 1,
        borderRadius     : 5,
        borderOpacity    : 0,
        textColor        : '#000000',
        fontFamily       : 'Verdana',
        fontSize         : 0,
        textShadowOffsetX: 0,
        textShadowOffsetY: 0,
        textShadowBlur   : 0,
        textShadowColor  : '#000000',
        padding          : .7,
        maxWidth         : 300,
        maxHeight        : 250,
        boxShadowColor   : '#000000',
        boxShadowSize    : 15,
        boxShadowOpacity : 25,
        boxShadowInner   : false
    }
};

/** @const */
var BORDER_STYLES = [
    "solid",
    "dotted",
    "dashed",
    "double",
    "groove",
    "ridge",
    "inset",
    "outset"
];

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
    "VL Gothic",
    "Helvetica Neue",
    "Segoe UI",
    "Lucida Grande",
    "Monaco"
].sort();

/**
 * Convert the theme to jQuery.css()-form
 * @param {CSS_THEMES} theme A theme object in internal format
 * @return Object Object-hash with CSS properties in the keys and their values
 */
var toCSS = function (theme) {
    if (!theme) return {};

    // background
    var bgcMain = theme.bgColor1,
        bgcSec = theme.bgColor2,
        bgcOpacity = theme.bgcOpacity / 100;

    if (bgcOpacity < 1) {
        bgcMain = hex2Rgba(bgcMain, bgcOpacity);
        bgcSec = hex2Rgba(bgcSec, bgcOpacity);
    }
    if (theme.bgcLinear) {
        bgcMain = sprintf('linear-gradient(180deg, {0}, {1})', bgcMain, bgcSec);
    }

    // border
    var borderOpacity = theme.borderOpacity / 100;
    var borderColor = borderOpacity < 1 ? hex2Rgba(theme.borderColor, borderOpacity) : theme.borderColor;
    var border = [theme.borderWidth + 'px', theme.borderStyle, borderColor].join(' ');
    var borderRadius = theme.borderRadius + 'px';

    // text
    var textColor = theme.textColor;
    var fontFamily = theme.fontFamily;
    var fontSize = theme.fontSize === 0 ? 'initial' : theme.fontSize + 'px';
    var textShadow;
    if (!theme.textShadowOffsetX && !theme.textShadowOffsetY && !theme.textShadowBlur) textShadow = 'none';
    else {
        var textShadowX = theme.textShadowOffsetX + 'px';
        var textShadowY = theme.textShadowOffsetY + 'px';
        var textShadowBlur = theme.textShadowBlur + 'px';
        textShadow = [textShadowX, textShadowY, textShadowBlur, theme.textShadowColor].join(' ');
    }

    // box
    var maxWidth = theme.maxWidth || 'none';
    var maxHeight = theme.maxHeight || 'none';
    var padding = theme.padding + 'em';
    var boxShadowOpacity = theme.boxShadowOpacity / 100;
    var boxShadowColor = boxShadowOpacity < 1 ? hex2Rgba(theme.boxShadowColor, boxShadowOpacity) : theme.boxShadowColor;
    var boxShadowSize = theme.boxShadowSize + 'px';
    var boxShadow = [theme.boxShadowInner ? 'inset' : '', 0, 0, boxShadowSize, boxShadowColor].join(' ');

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

exports.THEMES = CSS_THEMES;
exports.FONTS = FONTS;
exports.BORDER_STYLES = BORDER_STYLES;
exports.toCSS = toCSS;