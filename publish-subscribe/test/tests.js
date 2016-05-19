"use strict";

var expect = require("chai").expect;

var SmartEventBus = require("../smart-event-bus");

describe("SmartEvenBus", () => {
    describe("publish-subscribe", () => {
        it("should work", () => {
            var bus = new SmartEventBus();
            var data = { text: "hello" };

            var callCount = 0;

            // First subscription
            bus.subscribe("test-message", (message) => {
                expect(message).to.equal(data);
                callCount++;
            });

            // Second subscription
            bus.subscribe("test-message", (message) => {
                expect(message).to.equal(data);
                callCount++;
            });

            bus.publish("test-message", data);

            expect(callCount).to.equal(2);
        });
    });

    describe("register", () => {

        const actualMessage = {
            text: "Hello"
        };
        
        it("should add handler for all onXXX methods", () => {
            var callCount = 0;

            const TestObject = class {
                onData(message) {
                    expect(message).to.equal(actualMessage);
                    callCount++;
                }
                
                onInfo(message) {
                    expect(message).to.equal(actualMessage);
                    callCount++;
                }
            }

            let object = new TestObject();

            const eventBus = new SmartEventBus();
            eventBus.register(object);

            eventBus.publish("Data", actualMessage);
            eventBus.publish("Info", actualMessage);

            expect(callCount).to.equal(2);
        });

        it("should add handler for onXXX methods for object literal", () => {
            var callCount = 0;

            let object = {
                onData(message) {
                    expect(message).to.equal(actualMessage);
                    callCount++;
                }
            };

            const eventBus = new SmartEventBus();
            eventBus.register(object);

            eventBus.publish("Data", actualMessage);

            expect(callCount).to.equal(1);
        });

        it("should not add handler for non-function members", () => {
            var callCount = 0;

            let object = {
                onData: "function"
            };

            const eventBus = new SmartEventBus();
            eventBus.register(object);

            expect(eventBus.handlers["Data"]).is.undefined;
        });

        it("should add handler for onXXX methods for prototype classes", () => {
            var callCount = 0;

            function TestObject() { };

            TestObject.prototype.onData = function (message) {
                expect(message).to.equal(actualMessage);
                callCount++;
            };

            let object = new TestObject();

            const eventBus = new SmartEventBus();
            eventBus.register(object);

            eventBus.publish("Data", actualMessage);

            expect(callCount).to.equal(1);
        });

        it("should add handler for onXXX methods for ES6 classes", () => {
            var callCount = 0;

            class TestObject {
                onData(message) {
                    expect(message).to.equal(actualMessage);
                    callCount++;
                }
            }

            let object = new TestObject();

            const eventBus = new SmartEventBus();
            eventBus.register(object);

            eventBus.publish("Data", actualMessage);

            expect(callCount).to.equal(1);
        });

        it("should add handler for onXXX methods for ES6 class literals", () => {
            var callCount = 0;

            const TestObject = class {
                onData(message) {
                    expect(message).to.equal(actualMessage);
                    callCount++;
                }
            }

            let object = new TestObject();

            const eventBus = new SmartEventBus();
            eventBus.register(object);

            eventBus.publish("Data", actualMessage);

            expect(callCount).to.equal(1);
        });

        it("should add handler for onXXX methods for ES6 inherited classes", () => {
            var callCount = 0;

            class TestObject {
                onData(message) {
                    expect(message).to.equal(actualMessage);
                    callCount++;
                }
            }
            
            class ExtraTestObject extends TestObject {                
            }

            let object = new ExtraTestObject();

            const eventBus = new SmartEventBus();
            eventBus.register(object);

            eventBus.publish("Data", actualMessage);

            expect(callCount).to.equal(1);
        });

    });
});