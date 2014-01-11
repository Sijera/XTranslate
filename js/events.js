'use strict';

/**
 * Base class for all event-driven objects
 * @constructor
 */
var EventDriven = function () {
    Object.defineProperty(this, 'events', {value: {}, enumerable: false});
};

/**
 * Subscribe on events for specific object
 * @param {String} eventName Name of the event(s). In case of many must be separated by one space (" ").
 * @param {Function} callback Handler for this sort of events
 * @param {Object} [context]
 */
EventDriven.prototype.on = function (eventName, callback, context) {
    if (eventName.indexOf(' ') > -1) {
        eventName.trim().split(' ').forEach(function (eventName) {
            this.on(eventName, callback, context);
        }, this);
        return this;
    }

    // check on duplicates before adding
    if (!this.events[eventName]) this.events[eventName] = [];
    var eventData, events = [].concat(this.events[eventName]);
    while (eventData = events.shift()) {
        if (eventData.callback === callback && eventData.context === context) return this;
    }

    this.events[eventName].push({callback: callback, context: context});
    return this;
};

/**
 * The same like .on(), but after first call will be removed from the events-list
 * @param eventName
 * @param callback
 * @param [context]
 */
EventDriven.prototype.once = function (eventName, callback, context) {
    var callOnce = function () {
        callback.apply(context, arguments);
        this.off(eventName, callOnce);
    }.bind(this);
    return this.on(eventName, callOnce);
};

/**
 * Unsubscribe from getting events for specific object
 * In case of run without arguments all the events will be cleared
 * @param [eventName]
 * @param [context]
 */
EventDriven.prototype.off = function (eventName, context) {
    if (!arguments.length) this.events = {};
    else {
        if (!context) this.events[eventName] = [];
        else {
            this.events[eventName] = (this.events[eventName] || [])
                .filter(function (data) {
                    return typeof context == 'function'
                        ? context !== data.callback
                        : context !== data.context;
                }, this);
        }
    }
    return this;
};

/**
 * Fire an event with specific name
 * Extra arguments can be passed to callbacks
 * @param eventName
 * @param [args*]
 */
EventDriven.prototype.trigger = function (eventName, args) {
    var list = this.events[eventName] || [],
        params = Array.prototype.slice.call(arguments, 1),
        results = [];

    list.forEach(function (data) {
        results.push(data.callback.apply(data.context, params));
    });
    return results;
};

/**
 * Propagate the event to other component with all or part of incoming arguments
 * @param {String} eventName
 * @param {EventDriven|UIComponent|*} component
 * @param {Array|Number} [sliceArgs] Optional parameter to discard some arguments to not send it with the event
 */
EventDriven.prototype.propagate = function (eventName, component, sliceArgs) {
    return this.on(eventName, function () {
        var args = Array.prototype.slice.apply(arguments, [].concat(sliceArgs));
        component.trigger.apply(component, [eventName].concat(args));
    });
};

exports.EventDriven = EventDriven;