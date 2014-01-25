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
 * Creates a HTML-element and puts it inside invisible DOM-container (aka spawning pool, hello StarCraft!:)
 * We must keep the element attached in the DOM to make possible calculate its dimensions (padding, width, height, etc.)
 * @return {jQuery}
 */
exports.spawnElement = function __(htmlStr) {
    if (!__.$pool) {
        __.$pool = $('<div id="spawningPool"/>').css({
            position: 'relative',
            width   : 0,
            height  : 0,
            overflow: 'hidden'
        }).appendTo(document.body);
    }
    return $(htmlStr).appendTo(__.$pool);
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

exports.isControlKey = function (e) {
    var isAppleDevice = navigator.appVersion.indexOf('Mac') !== -1;
    var keyCode = e.which;
    if (isAppleDevice) {
        return e.metaKey ||
            keyCode === 91 || // (Left Cmd)
            keyCode === 93;  // (Right Cmd)
    } else {
        return e.ctrlKey || keyCode === 17;
    }
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
 * Find objects in array by its property
 * @param {Array.<Object>} itemList List with items
 * @param {String} field Name of property in the item
 * @param {RegExp|String} subject Regular expression or string to test the field
 * @param {Boolean=} onlyFirst If it is true, don't search all matches, only one!
 * @return Array List of matched objects
 */
exports.objLookup = function (itemList, field, subject, onlyFirst) {
    var item, value, matched,
        searchResult = [],
        isRegExp = subject instanceof RegExp;

    for (var i = 0, len = itemList.length; i < len; i++) {
        item = itemList[i];
        value = item[field];
        matched = isRegExp && subject.test(value);
        matched = matched || (!isRegExp && value.toLowerCase().indexOf(subject.toLowerCase()) === 0);
        if (matched) {
            searchResult.push(item);
            if (onlyFirst) break;
        }
    }
    return searchResult;
};