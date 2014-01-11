'use strict';

/**
 * Inheritance function
 * @param {Function} Child
 * @param {Function} Parent
 */
exports.inherit = function (Child, Parent) {
    var childProto = Child.prototype;

    // Inherit parent's prototype
    Child.prototype = Object.create(Parent.prototype);

    // Copy all properties from old prototype (including constructor, which will be overwritten)
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
            keyCode === 91 || //(Left Apple)
            keyCode === 93;  // (Right Apple)
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
 * Spawns a new element and insert it into DOM tree in invisible container
 * we must have element inserted in order to calculate its dimensions, padding & etc.
 *
 * @param {String} str
 * @return jQuery
 */
exports.spawnDomElement = function __(str) {
    if (!__.$pool) {
        __.$pool = $('<div id="spawning_pool"/>').css({
            position: 'relative',
            width   : 0,
            height  : 0,
            overflow: 'hidden'
        }).appendTo(document.body);
    }
    return $(str).appendTo(__.$pool);
};

/**
 * Find items by test a regexp on provided object's field
 * @param {Array.<Object>} itemList List with items
 * @param {String} field Name of property in the item
 * @param {RegExp|String} subject Regular expression or string to test the field
 * @param {Boolean} onlyFirst If it is true, don't search all matches, only one!
 */
exports.findInObjList = function (itemList, field, subject, onlyFirst) {
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

/**
 * Compare two plain objects
 * @param obj1
 * @param obj2
 * @return Boolean
 */
exports.isEqualObjects = function isEqualObjects(obj1, obj2) {
    if (!(obj1 instanceof Object) || !(obj2 instanceof Object)) return obj1 === obj2;
    if (obj1.constructor !== obj2.constructor) return false;

    var keys1 = Object.keys(obj1).sort();
    var keys2 = Object.keys(obj2).sort();

    if (keys1.join('') != keys2.join('')) return false;

    for (var i = 0, len = keys1.length; i < len; i++) {
        var p = keys1[i];
        if (obj1[p] instanceof Object) {
            if (!isEqualObjects(obj1[p], obj2[p])) return false;
        }
        else if (obj1[p] !== obj2[p]) return false;
    }

    return true;
};

exports.isBrowser = function (name) {
    name = name.toLowerCase();
    return window[name] || navigator.userAgent.toLowerCase().indexOf(name) > -1;
};