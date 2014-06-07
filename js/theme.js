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
        fontSize         : 13,
        textShadowOffsetX: 1,
        textShadowOffsetY: 1,
        textShadowBlur   : 0,
        textShadowColor  : '#000000',
        padding          : 1, // em
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
        fontSize         : 13,
        textShadowOffsetX: 0,
        textShadowOffsetY: 0,
        textShadowBlur   : 0,
        textShadowColor  : '#000000',
        padding          : 0.8, // em
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
    "VL Gothic"
];

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
    var border = [zoomedValue(theme.borderWidth) + 'px', theme.borderStyle, borderColor].join(' ');
    var borderRadius = zoomedValue(theme.borderRadius) + 'px';

    // text
    var fontFamily = theme.fontFamily;
    var fontSize = zoomedValue(theme.fontSize) + 'px';
    var textColor = theme.textColor;
    var textShadowX = zoomedValue(theme.textShadowOffsetX);
    var textShadowY = zoomedValue(theme.textShadowOffsetY);
    var textShadowBlur = zoomedValue(theme.textShadowBlur);
    var textShadow = [textShadowX + 'px', textShadowY + 'px', textShadowBlur + 'px', theme.textShadowColor].join(' ');
    if (!textShadowX && !textShadowY && !textShadowBlur) textShadow = 'none';

    // box
    var maxWidth = zoomedValue(theme.maxWidth) || 'none';
    var maxHeight = zoomedValue(theme.maxHeight) || 'none';
    var padding = theme.padding + 'em';
    var boxShadowOpacity = theme.boxShadowOpacity / 100;
    var boxShadowColor = boxShadowOpacity < 1 ? hex2Rgba(theme.boxShadowColor, boxShadowOpacity) : theme.boxShadowColor;
    var boxShadowSize = zoomedValue(theme.boxShadowSize) + 'px';
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

// keep actual pixel-based sizes despite on the page zooming
var zoomedValue = function (value) {
    var pixelRatio = 1 / (window.devicePixelRatio || 1);
    return Number((+value * pixelRatio).toFixed(1));
};

exports.THEMES = CSS_THEMES;
exports.FONTS = FONTS;
exports.BORDER_STYLES = BORDER_STYLES;
exports.toCSS = toCSS;