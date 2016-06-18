"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var error_accumulator_1 = require("./error-accumulator");
var validation_context_1 = require("./validation-context");
__export(require("./rules"));
function validate(value, done) {
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
    var val = value;
    var runValidator = function () {
        var validator = validators.shift();
        if (validator) {
            validator.run(validationContext, function (convertedValue, success) {
                if (success) {
                    val = convertedValue;
                }
                // Run next validator recursively.
                runValidator();
            }, value, value, value);
        }
        else {
            if (errorAccumulator.valid()) {
                var validationResult = {
                    valid: true,
                    convertedValue: val
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
        }
        runValidator();
    };
}
exports.validate = validate;
//# sourceMappingURL=index.js.map