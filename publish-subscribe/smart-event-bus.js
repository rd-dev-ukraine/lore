"use strict";

function SmartEventBus() {
    this.handlers = {};
}

SmartEventBus.prototype.subscribe = function (message, callback) {
    if (!message) {
        throw "Message is null or empty or not defined.";
    }

    if (!callback) {
        throw "Callback is null or empty or not defined.";
    }

    this.handlers[message] = this.handlers[message] || [];
    this.handlers[message].push(callback);
};

SmartEventBus.prototype.publish = function (message, data) {
    if (!message) {
        throw "Message is null or empty or not defined.";
    }

    // Data and rest arguments could be empty

    var callbacks = this.handlers[message];

    if (callbacks && callbacks.length) {
        var args = Array.from(arguments).slice(1);

        callbacks.forEach(function (c) {
            c.apply(null, args);
        });
    }
};

module.exports = SmartEventBus;