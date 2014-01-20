'use strict';

var inherit = require('./utils').inherit,
    EventDriven = require('./events').EventDriven,
    Chrome = require('./extension/chrome').Chrome;

/**
 * XTranslate (browser extension) - Easy translate text on web pages
 * @constructor
 */
var App = function (options) {
    App.superclass.constructor.call(this, options);

    /** @type {Google|Yandex|Bing} */ this.vendor = undefined;
    /** @type {Chrome|Opera|Firefox} */ this.extension = new Chrome();

    this.init();
};

inherit(App, EventDriven);

App.prototype.state = {
    header: {
        activeTab: 0
    },
    scroll: 0
};

App.prototype.init = function () {
    this.extension.loadState().done(this.onReady.bind(this));
};

/** @private */
App.prototype.onReady = function (state) {
    this.state = $.extend(true, this.state, state);
    this.initState('', this.state);
    this.trigger('ready');
};

/** @private */
App.prototype.initState = function (parentChain, stateObj) {
    Object.keys(stateObj).forEach(function (prop) {
        var chain = parentChain ? parentChain + '.' + prop : prop;
        var value = stateObj[prop];
        this.defineProp(chain.split('.'), value, true);
        if (typeof value == 'object' && typeof value !== null) this.initState(chain, value);
    }, this);
};

/**
 * Save the state on external resource (local storage, remote server, etc.)
 */
App.prototype.sync = function () {
    this.extension.saveState(this.state);
};

/**
 * Set new value of property in the state
 * @param {String} chain One or more property names, separated by dot
 * @param {Number|String|Boolean|Array|Object} [value]
 * @param {Boolean} [silent] Don't emit the change event
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
            this.trigger('change:' + chain, value, oldValue);
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

App.prototype.clear = function (chain) {
    this.set(chain, undefined);
};

App.prototype.toJSON = function () {
    return JSON.parse(JSON.stringify(this.state));
};

exports.App = App;