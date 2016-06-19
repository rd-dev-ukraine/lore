"use strict";
var error_accumulator_1 = require("./error-accumulator");
var validation_context_1 = require("./validation-context");
var rules = require("./rules");
exports.rules = rules;
function validateWithCallback(value, done) {
    var validators = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        validators[_i - 2] = arguments[_i];
    }
    if (!done) {
        throw new Error("Done callback is required.");
    }
    if (!validators || !validators.length) {
        throw new Error("At least one validator is required");
    }
    var errorAccumulator = new error_accumulator_1.default();
    var validationContext = new validation_context_1.default("", errorAccumulator);
    var rule = rules.combineRules.apply(rules, validators);
    var parsedValue = rule.runParse(value, value, value);
    rule.runValidate(validationContext, function () {
        if (errorAccumulator.valid()) {
            var validationResult = {
                valid: true,
                convertedValue: parsedValue
            };
            done(validationResult);
        }
        else {
            var validationResult = {
                valid: false,
                convertedValue: null,
                errors: errorAccumulator.errors()
            };
            done(validationResult);
        }
    }, parsedValue, parsedValue, parsedValue);
}
exports.validateWithCallback = validateWithCallback;
function validateWithPromise(value) {
    var validators = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        validators[_i - 1] = arguments[_i];
    }
    if (!validators || !validators.length) {
        throw new Error("At least one validator is required");
    }
    return new Promise(function (resolve, reject) {
        validateWithCallback.apply(void 0, [value, function (result) {
            if (result.valid) {
                resolve(result.convertedValue);
            }
            else {
                reject(result.errors);
            }
        }].concat(validators));
    });
}
exports.validateWithPromise = validateWithPromise;
//# sourceMappingURL=index.js.map