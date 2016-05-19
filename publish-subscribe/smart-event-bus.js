"use strict";

class SmartEventBus {
    constructor() {
        this.handlers = {};
    }

    /** Registers callback for processing message. */
    subscribe(message, callback) {
        if (!message) {
            throw "Message is null or empty or not defined.";
        }

        if (!callback) {
            throw "Callback is null or empty or not defined.";
        }

        this.handlers[message] = this.handlers[message] || [];
        this.handlers[message].push(callback);
    }

    /** Removes callback from processing message. */
    unsubscribe(message, callback) {
        if (!message) {
            throw "Message is null or empty or not defined.";
        }

        if (!callback) {
            throw "Callback is null or empty or not defined.";
        }

        const handlerList = this.handlers[message];

        if (handlerList && handlerList.length) {
            const index = handlerList.indexOf(callback);
            if (index !== -1) {
                handlerList.splice(index, 1);
            }
        }
    }

    publish(message, data) {
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
    }

    /**
     * Register subscribers and publishers for object methods.
     * Each method started with on<MessageName> will be registered as subscriber for MessageName.
     * Each method started with publish<MessageName> will be replaced with method which publishes MessageName on call.
     * 
     * Methods are searched 
     */
    register(object) {
        if (object === null || object === undefined) {
            throw "Object is null or undefined.";
        }

        Object.keys(this.getProps(object))
            .forEach(prop => {
                let val = object[prop];

                if (typeof val !== "function") {
                    return;
                }

                if (prop.startsWith("on")) {
                    const messageName = prop.substring(2);
                    this.subscribe(messageName, data => {
                        object[prop].call(object, data);
                    });
                }

                if (prop.startsWith("publish")) {
                    const messageName = prop.substring(7);
                    object[prop] = (data) => {
                        this.publish(messageName, data);
                    };
                }
            });
    }

    getProps(object) {
        let hash = Object.getOwnPropertyNames(object)
            .filter(prop => prop !== "constructor")
            .reduce((hash, prop) => {
                hash[prop] = prop;
                return hash;
            }, {});

        let prototype = Object.getPrototypeOf(object);
        if (prototype) {
            hash = Object.assign(hash, this.getProps(prototype));
        }

        return hash;
    }
}

module.exports = SmartEventBus;