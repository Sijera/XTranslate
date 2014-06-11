'use strict';

var UTILS = require('../utils'),
    inherit = UTILS.inherit,
    TextInput = require('./text_input').TextInput,
    FormControl = require('./form_control').FormControl,
    FlyingPanel = require('./flying_panel').FlyingPanel;

/**
 * @constructor
 */
var ColorPicker = function (options) {
    options = $.extend({color: PALETTE_COLORS[0][0]}, options);
    ColorPicker.superclass.constructor.call(this, options);

    this.colorBoxOnRight = !!options.colorBoxOnRight;
    this.useInput = options.useInput;
    this.useRgbFormat = !!options.useRgbFormat;
    this.titleHint = options.titleHint;
    this.palette = ColorPicker.PALETTE;

    this.createDom();
    this.setValue(options.color, true);
    this.setTitle(options.title);
};

inherit(ColorPicker, FormControl);

/** @private */
ColorPicker.prototype.createDom = function () {
    this.$container.addClass('colorPicker');

    this.$colorBox = $('<span class="colorBox" tabindex="-1"/>')
        .attr('title', this.titleHint)
        .on('click', this.showPalette.bind(this))
        .on('keydown', this.onColorKeyIncrease.bind(this))
        .appendTo(this.$container);

    if (this.useInput) {
        this.input = new TextInput({maxLength: this.useRgbFormat ? 11 : 7, restoreOnBlur: true}).appendTo(this);
        this.input.addValidator(this.parseColor, this);
        this.input.on('change', this.onColorEdit, this);
        this.input.on('keydown', this.onColorKeyIncrease, this);
        this.input.$input.attr('spellcheck', false);
        if (this.useRgbFormat) this.input.$container.addClass('rgb');
    }

    if (this.colorBoxOnRight) {
        this.$colorBox.addClass('right').appendTo(this.$container);
    }
};

ColorPicker.prototype.disable = function () {
    if (this.useInput) this.input.disable();
    return ColorPicker.superclass.disable.apply(this, arguments);
};

ColorPicker.prototype.enable = function () {
    if (this.useInput) this.input.enable();
    return ColorPicker.superclass.enable.apply(this, arguments);
};

/** @private */
ColorPicker.prototype.createPalette = function () {
    if (!this.palette) {
        this.palette = ColorPicker.PALETTE = new FlyingPanel({
            className: 'colorPalette',
            fitToWidth: false,
            autoHide: true
        });

        PALETTE_COLORS.forEach(function (colors) {
            var $colorSet = $('<div class="colorSet"/>').appendTo(this.palette.$container);
            $colorSet.append(colors.map(function (color) {
                return $('<span class="color"/>').data('color', color).css('background', color);
            }, this));
        }, this);
    }
};

ColorPicker.prototype.showPalette = function () {
    this.createPalette();
    this.palette.$container.on('click', '.color', this.onColorClick.bind(this));
    this.palette.setAnchor(this.$colorBox);
    this.palette.show();
};

ColorPicker.prototype.hidePalette = function () {
    if (!this.palette) return;
    this.palette.off('click');
    this.palette.hide();
};

ColorPicker.prototype.parseColor = function (color) {
    color = color.toLowerCase();
    color = HTML_COLORS[color] || UTILS.rgb2hex(color) || color;
    if (color.match(/^#[0-9A-F]{6}$/i)) return color;
    return false;
};

/**
 * Set a new value for color
 * @param {String} color HEX or RGB format of color
 * @param {Boolean} [silent]
 * @param {Boolean} [isTyping]
 * @return {Boolean} True, if color was changed and it has a valid format
 */
ColorPicker.prototype.setValue = function (color, silent, isTyping) {
    color = this.parseColor(color);
    if (!color || this.color == color) return false;
    this.color = color;

    var value = this.getValue();
    this.$colorBox.css('background-color', color);
    if (!silent) this.trigger('change', value);

    if (this.useInput) {
        if (this.useRgbFormat) value = value.replace(/[(a-z)]/gi, '');
        this.input.setValue(value, false, isTyping);
    }

    this.hidePalette();
    return true;
};

ColorPicker.prototype.getValue = function () {
    return this.useRgbFormat ? UTILS.hex2Rgba(this.color) : this.color;
};

/** @private */
ColorPicker.prototype.onColorClick = function (e) {
    var color = $(e.target).data('color');
    this.setValue(color);
};

/** @private */
ColorPicker.prototype.onColorEdit = function (color) {
    this.setValue(color, false, true);
};

/** @private */
ColorPicker.prototype.onColorKeyIncrease = function (e) {
    var keyCode = e.which,
        up = keyCode == 38,
        down = keyCode == 40,
        keys = [
            /*R*/ e.ctrlKey,
            /*G*/ e.shiftKey,
            /*B*/ e.altKey
        ];

    if (up || down) {
        var step = up ? +1 : -1;
        var color = this.color.match(/#(.{2})(.{2})(.{2})/).splice(1);

        keys.forEach(function (active, i) {
            if (active) {
                var c = Number('0x' + color[i]) + step;
                if (c >= 0 && c <= 255) {
                    c = Number(c).toString(16);
                    if (c.length == 1) c = '0' + c;
                    color[i] = c;
                }
            }
        });

        color = '#' + color.join('');
        if (this.color != color) {
            this.setValue(color.toString());
            e.preventDefault();
        }
    }
};

/** @const */
var PALETTE_COLORS = [
    ['#ffffff', '#e7e7e7', '#cccccc', '#b3b3b3', '#999999', '#808080'],
    ['#000000', '#737373', '#595959', '#3f3f3f', '#262626', '#1c1b21'],
    ['#fe0000', '#ffcbcd', '#ff999a', '#ff6666', '#ff3334', '#800001'],
    ['#02aff1', '#cdeefd', '#99dff9', '#68d0f7', '#33c1f3', '#025776'],
    ['#0070c0', '#cce2f0', '#66a8d8', '#0071c1', '#013861', '#001b30'],
    ['#ffff01', '#ffffcd', '#feff99', '#ffff66', '#ffff33', '#bebf00'],
    ['#ffc000', '#fff2cd', '#ffe699', '#fed966', '#bf9100', '#805f00'],
    ['#01af50', '#cbf0de', '#99dfba', '#67d097', '#00843b', '#005727'],
    ['#01ff01', '#ceffcf', '#99ff9b', '#65fe66', '#00bf00', '#007f01'],
    ['#7030a0', '#e3d5ec', '#c6acd9', '#aa83c6', '#542478', '#371851']
];

/** @const */
var HTML_COLORS = {
    "black"               : "#000000",
    "navy"                : "#000080",
    "darkblue"            : "#00008b",
    "mediumblue"          : "#0000cd",
    "blue"                : "#0000ff",
    "darkgreen"           : "#006400",
    "green"               : "#008000",
    "teal"                : "#008080",
    "darkcyan"            : "#008b8b",
    "deepskyblue"         : "#00bfff",
    "darkturquoise"       : "#00ced1",
    "mediumspringgreen"   : "#00fa9a",
    "lime"                : "#00ff00",
    "springgreen"         : "#00ff7f",
    "aqua"                : "#00ffff",
    "cyan"                : "#00ffff",
    "midnightblue"        : "#191970",
    "dodgerblue"          : "#1e90ff",
    "lightseagreen"       : "#20b2aa",
    "forestgreen"         : "#228b22",
    "seagreen"            : "#2e8b57",
    "darkslategray"       : "#2f4f4f",
    "limegreen"           : "#32cd32",
    "mediumseagreen"      : "#3cb371",
    "turquoise"           : "#40e0d0",
    "royalblue"           : "#4169e1",
    "steelblue"           : "#4682b4",
    "darkslateblue"       : "#483d8b",
    "mediumturquoise"     : "#48d1cc",
    "indigo "             : "#4b0082",
    "darkolivegreen"      : "#556b2f",
    "cadetblue"           : "#5f9ea0",
    "cornflowerblue"      : "#6495ed",
    "mediumaquamarine"    : "#66cdaa",
    "dimgray"             : "#696969",
    "slateblue"           : "#6a5acd",
    "olivedrab"           : "#6b8e23",
    "slategray"           : "#708090",
    "lightslategray"      : "#778899",
    "mediumslateblue"     : "#7b68ee",
    "lawngreen"           : "#7cfc00",
    "chartreuse"          : "#7fff00",
    "aquamarine"          : "#7fffd4",
    "maroon"              : "#800000",
    "purple"              : "#800080",
    "olive"               : "#808000",
    "gray"                : "#808080",
    "skyblue"             : "#87ceeb",
    "lightskyblue"        : "#87cefa",
    "blueviolet"          : "#8a2be2",
    "darkred"             : "#8b0000",
    "darkmagenta"         : "#8b008b",
    "saddlebrown"         : "#8b4513",
    "darkseagreen"        : "#8fbc8f",
    "lightgreen"          : "#90ee90",
    "mediumpurple"        : "#9370db",
    "darkviolet"          : "#9400d3",
    "palegreen"           : "#98fb98",
    "darkorchid"          : "#9932cc",
    "yellowgreen"         : "#9acd32",
    "sienna"              : "#a0522d",
    "brown"               : "#a52a2a",
    "darkgray"            : "#a9a9a9",
    "lightblue"           : "#add8e6",
    "greenyellow"         : "#adff2f",
    "paleturquoise"       : "#afeeee",
    "lightsteelblue"      : "#b0c4de",
    "powderblue"          : "#b0e0e6",
    "firebrick"           : "#b22222",
    "darkgoldenrod"       : "#b8860b",
    "mediumorchid"        : "#ba55d3",
    "rosybrown"           : "#bc8f8f",
    "darkkhaki"           : "#bdb76b",
    "silver"              : "#c0c0c0",
    "mediumvioletred"     : "#c71585",
    "indianred "          : "#cd5c5c",
    "peru"                : "#cd853f",
    "chocolate"           : "#d2691e",
    "tan"                 : "#d2b48c",
    "lightgray"           : "#d3d3d3",
    "thistle"             : "#d8bfd8",
    "orchid"              : "#da70d6",
    "goldenrod"           : "#daa520",
    "palevioletred"       : "#db7093",
    "crimson"             : "#dc143c",
    "gainsboro"           : "#dcdcdc",
    "plum"                : "#dda0dd",
    "burlywood"           : "#deb887",
    "lightcyan"           : "#e0ffff",
    "lavender"            : "#e6e6fa",
    "darksalmon"          : "#e9967a",
    "violet"              : "#ee82ee",
    "palegoldenrod"       : "#eee8aa",
    "lightcoral"          : "#f08080",
    "khaki"               : "#f0e68c",
    "aliceblue"           : "#f0f8ff",
    "honeydew"            : "#f0fff0",
    "azure"               : "#f0ffff",
    "sandybrown"          : "#f4a460",
    "wheat"               : "#f5deb3",
    "beige"               : "#f5f5dc",
    "whitesmoke"          : "#f5f5f5",
    "mintcream"           : "#f5fffa",
    "ghostwhite"          : "#f8f8ff",
    "salmon"              : "#fa8072",
    "antiquewhite"        : "#faebd7",
    "linen"               : "#faf0e6",
    "lightgoldenrodyellow": "#fafad2",
    "oldlace"             : "#fdf5e6",
    "red"                 : "#ff0000",
    "fuchsia"             : "#ff00ff",
    "magenta"             : "#ff00ff",
    "deeppink"            : "#ff1493",
    "orangered"           : "#ff4500",
    "tomato"              : "#ff6347",
    "hotpink"             : "#ff69b4",
    "coral"               : "#ff7f50",
    "darkorange"          : "#ff8c00",
    "lightsalmon"         : "#ffa07a",
    "orange"              : "#ffa500",
    "lightpink"           : "#ffb6c1",
    "pink"                : "#ffc0cb",
    "gold"                : "#ffd700",
    "peachpuff"           : "#ffdab9",
    "navajowhite"         : "#ffdead",
    "moccasin"            : "#ffe4b5",
    "bisque"              : "#ffe4c4",
    "mistyrose"           : "#ffe4e1",
    "blanchedalmond"      : "#ffebcd",
    "papayawhip"          : "#ffefd5",
    "lavenderblush"       : "#fff0f5",
    "seashell"            : "#fff5ee",
    "cornsilk"            : "#fff8dc",
    "lemonchiffon"        : "#fffacd",
    "floralwhite"         : "#fffaf0",
    "snow"                : "#fffafa",
    "yellow"              : "#ffff00",
    "lightyellow"         : "#ffffe0",
    "ivory"               : "#fffff0",
    "white"               : "#ffffff"
};

exports.ColorPicker = ColorPicker;