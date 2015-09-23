'use strict';

var UTILS = require('./utils'),
    inherit = UTILS.inherit,
    debounce = UTILS.debounce,
    themes = require('./theme').THEMES,
    Google = require('./vendors/google').Google,
    Yandex = require('./vendors/yandex').Yandex,
    Bing = require('./vendors/bing').Bing,
    Opera = require('./extension/opera').Opera,
    Chrome = require('./extension/chrome').Chrome,
    EventDriven = require('./events').EventDriven;

/**
 * @constructor
 * @description XTranslate - Easy translate text on web pages (chromium-based browser extension)
 * @property {Chrome|Opera} extension
 * @property {Google|Yandex|Bing} vendor
 */
var App = function (options) {
    options = $.extend({autoSave: true}, options);
    App.superclass.constructor.call(this, options);

    this.autoSave = options.autoSave;
    this.vendors = [new Google(), new Yandex(), new Bing()];
    this.extension = this.getExtension();
    this.localization = this.extension.getText.bind(this.extension);
    Object.defineProperty(this, 'vendor', {get: this.getVendor});

    this.init();
};

inherit(App, EventDriven);

/** @private */
App.prototype.getExtension = function () {
    var vendor = navigator.vendor.toLowerCase();
    if (vendor.indexOf('opera') > -1) return new Opera();
    return new Chrome();
};

/** @return {Vendor|*} */
App.prototype.getVendor = function (name, next) {
    name = name || this.get('settingsContainer.vendorBlock.activeVendor');
    var vendors = this.vendors;
    var vendor = vendors.filter(function (v) { return v.name === name; })[0];
    var index = vendors.indexOf(vendor);
    return next ? (vendors[index + 1] || vendors[0]) : vendor;
};

// Default settings
App.prototype.state = {
    headerBar: {
        activeTab: 0
    },
    vendors: {
        bing: {appId: ''}
    },
    settingsContainer: {
        popupDefinitions: {
            collapsed   : false,
            autoFocus   : true,
            autoPlay    : false,
            showPlayIcon: true,
            clickAction : true,
            selectAction: false,
            showActionIcon: true,
            keyAction   : true,
            spellCheck  : true,
            contextMenu : true,
            zoomValue   : 100, //%
            whiteTheme  : false,
            hotKey      : UTILS.getHotkey({altKey: true, char: 'X'})
        },
        vendorBlock     : {
            collapsed   : false,
            activeVendor: 'google',
            langFrom    : 'auto',
            langTo      : navigator.language.split('-')[0]
        },
        popupStyle      : {
            collapsed  : false,
            activeTheme: Object.keys(themes)[0],
            themes     : themes,
            customTheme: null
        },
        siteExclusions  : {
            collapsed: true,
            links    : ['acid3.acidtests.org']
        }
    },
    userInputContainer: {
        rememberText: false,
        text: ''
    }
};

/** @private */
App.prototype.init = function () {
    this.sync = debounce(this.sync.bind(this), 250);
    this.extension.getState(this.onReady.bind(this));
};

/** @private */
App.prototype.onReady = function (state) {
    state = state || {};

    var appVersion = this.extension.getInfo().version;
    if (appVersion !== state.version) {
        state.version = appVersion;
        state = $.extend(true, {}, this.state, state);
    }

    this.state = state;
    this.initState('', state);
    this.trigger('ready', state);
};

/** @private */
App.prototype.initState = function (parentChain, stateObj) {
    Object.keys(stateObj).forEach(function (prop) {
        var chain = parentChain ? parentChain + '.' + prop : prop;
        var value = stateObj[prop];
        this.defineProp(chain.split('.'), value);
        if ($.isPlainObject(value)) this.initState(chain, value);
    }, this);
};

/**
 * Save the current model state on external resource (e.x. local storage, remote server, etc)
 * @return {App}
 */
App.prototype.sync = function () {
    this.extension.setState(this.state);
    return this;
};

/**
 * Set new value of property in the state
 * @param {String} chain One or more property names, separated by dot
 * @param {Number|String|Boolean|Array|Object} [value]
 * @param {Boolean} [silent] Don't emit the change event
 * @return {App}
 */
App.prototype.set = function (chain, value, silent) {
    var chainArr = String(chain).split('.'),
        state = this.state;

    chainArr.forEach(function (prop, i) {
        var last = i === chainArr.length - 1;
        if (!last) {
            if (!state.hasOwnProperty(prop) || typeof state[prop] !== 'object') state[prop] = {};
            state = state[prop];
        }
        else if (last && state[prop] !== value) {
            this.defineProp(chainArr, silent ? value : state[prop]);
            state[prop] = value;
        }
    }, this);
    return this;
};

/** @private */
App.prototype.defineProp = function (chainArr, value) {
    var oldValue, topLvl = chainArr.length === 1;
    var chain = chainArr.join('.');
    var stateObj = topLvl ? this.state : this.get(chainArr.slice(0, -1).join('.'));
    var prop = topLvl ? chain : chainArr.slice(-1);
    if (typeof stateObj !== 'object') return;

    Object.defineProperty(stateObj, prop, {
        enumerable: true,
        configurable: true,
        get: function () {
            return value;
        },
        set: function (val) {
            if (value === val) return;
            oldValue = value;
            value = val;
            if (this.autoSave) this.sync();
            this.trigger('change:' + chain, value, oldValue);
            this.trigger('change', {chain: chain, value: value, prev: oldValue});
        }.bind(this)
    });
};

/**
 * Get the value of property in the state
 * @param {String} [chain]
 * @return {*}
 */
App.prototype.get = function (chain) {
    var prop, props = String(chain).split('.'),
        state = this.state;

    while (prop = props.shift()) {
        if (props.length > 0) {
            if (!state.hasOwnProperty(prop)) break;
            state = state[prop];
        }
        else {
            return state[prop];
        }
    }
};

App.prototype.clear = function (chain, silent) {
    this.set(chain, undefined, silent);
};

/** @private */
App.prototype.reset = function () {
    this.extension.setState({}, location.reload.bind(location, true));
};

App.prototype.toString = function () {
    return JSON.stringify(this.state, null, 4);
};

/** @return {App} */
exports.create = function (o) { return new App(o) };