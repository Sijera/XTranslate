'use strict';

/**
 * Inheritance function
 * @param {Function} Child
 * @param {Function} Parent
 */
exports.inherit = function (Child, Parent) {
    var childProto = Child.prototype;
    Child.prototype = Object.create(Parent.prototype);

    var props = Object.getOwnPropertyNames(childProto);
    for (var i = props.length; i--;) {
        if (childProto.hasOwnProperty(props[i])) {
            var desc = Object.getOwnPropertyDescriptor(childProto, props[i]);
            Object.defineProperty(Child.prototype, props[i], desc);
        }
    }

    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
};

/**
 * Create a HTML-element and put it inside invisible container.
 * Keeping the element attached in DOM needs to make possible calculate its dimensions before inserting it in appropriate place
 * @param {String} html
 * @return {jQuery}
 */
exports.spawnElement = function __(html) {
    if (!__.$pool) {
        __.$pool = $('<div id="spawning_pool"/>').css({
            position: 'relative',
            width   : 0,
            height  : 0,
            overflow: 'hidden'
        }).appendTo(document.body);
    }
    return $(html).appendTo(__.$pool);
};

exports.sprintf = function () {
    var args = Array.prototype.slice.call(arguments),
        str = args.shift();
    return str.replace(/\{(\d+)\}/g, function (str, index) { return args[index] });
};

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 */
exports.debounce = function (func, wait, immediate) {
    var timeout;

    function fn() {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        if (immediate && !timeout) func.apply(context, args);
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    }

    fn.source = func;
    fn.stop = function () {
        clearTimeout(timeout);
    };
    return fn;
};

exports.hex2Rgba = function (color, opacity) {
    if (color[0] != '#') return color;

    var name = 'rgb', rgba = [];
    color = color.substr(1);
    if (color.length == 3) color += color;

    for (var c = 0; c < color.length; c += 2) {
        rgba.push(parseInt(color.substr(c, 2), 16));
    }
    if (typeof opacity == 'number') {
        name += 'a';
        rgba.push(opacity);
    }

    return name + '(' + rgba.join(',') + ')';
};

exports.rgb2hex = function (color) {
    color = String(color).replace(/^rgba?\(|\s|\)$/gi, '');
    var colors = (color.match(/^(\d{1,3}),(\d{1,3}),(\d{1,3})$/) || []).splice(1);
    var isRgb = colors.length && colors.every(function (num) { return num >= 0 && num <= 255 });
    if (isRgb) {
        var R = Number(colors[0]).toString(16);
        var G = Number(colors[1]).toString(16);
        var B = Number(colors[2]).toString(16);
        if (R.length == 1) R = '0' + R;
        if (G.length == 1) G = '0' + G;
        if (B.length == 1) B = '0' + B;
        return ('#' + R + G + B).toUpperCase();
    }
    return false;
};

exports.parseUrl = function (url) {
    url = url || location.href;
    var chunks = url.match(/^(?:([a-z]+:)\/\/)?((?:[a-z0-9-]+\.)+[a-z]+)(?::(\d+))?(\/(?:[^?]+)*)?(\?[^#]+)?(#.*)?$/i) || [];
    return {
        href: chunks[0] || url,
        protocol: chunks[1] || 'http:',
        host: chunks[2],
        port: Number(chunks[3] || 80),
        pathname: chunks[4] || '/',
        search: chunks[5] || '',
        hash: chunks[6] || ''
    };
};

/**
 * Find object(s) in array by specific property name
 * @param {Array.<Object>} objectsList
 * @param {String} propName
 * @param {RegExp|String} testValue Regular expression or string to test the field
 * @param {Boolean=} onlyFirst If it is true, don't search all matches, only one!
 * @return Array List of matched objects
 */
exports.findObjByProp = function (objectsList, propName, testValue, onlyFirst) {
    var item, value, matched,
        searchResult = [],
        isRegExp = testValue instanceof RegExp;

    for (var i = 0, len = objectsList.length; i < len; i++) {
        item = objectsList[i];
        value = item[propName];
        matched = isRegExp && testValue.test(value);
        matched = matched || (!isRegExp && value.toLowerCase().indexOf(testValue.toLowerCase()) === 0);
        if (matched) {
            searchResult.push(item);
            if (onlyFirst) break;
        }
    }
    return searchResult;
};

/**
 * Get pressed hotkey from keyboard event
 * @param {KeyboardEvent} e Usually it should be keyDown-event
 * @param {RegExp} [charPattern] Regular expression to check matched char
 * @return {Array} List of pressed keys in text representation
 */
exports.getHotkey = function (e, charPattern) {
    charPattern = charPattern || /[A-Z0-9]/;

    var key = e.which,
        isAppleDevice = navigator.appVersion.indexOf('Mac') !== -1,
        char = String.fromCharCode(Number(key)),
        shiftKey = e.shiftKey,
        altKey = e.altKey,
        ctrlKey = isAppleDevice ? (e.metaKey || key === 91 || key === 93) : (e.ctrlKey || key === 17),
        hotKey = [];

    if (ctrlKey) hotKey.push('Ctrl');
    if (shiftKey) hotKey.push('Shift');
    if (altKey) hotKey.push('Alt');
    if (charPattern.test(char)) hotKey.push(char);
    return hotKey;
};

/**
 * Escape special characters of regular expressions
 * @param {String} text
 * @param {String} [exceptChars]
 * @return {XML|string|void}
 */
exports.escapeReg = function (text, exceptChars) {
    exceptChars = exceptChars || '';
    return text.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, function (char) {
        if (exceptChars.indexOf(char) > -1) return char;
        return '\\' + char;
    });
};