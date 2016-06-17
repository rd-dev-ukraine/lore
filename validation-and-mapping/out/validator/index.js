"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
/// <reference path="./validator.d.ts" />
var error_accumulator_1 = require("./error-accumulator");
var validation_context_1 = require("./validation-context");
__export(require("./rules"));
function validate(value) {
    var validators = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        validators[_i - 1] = arguments[_i];
    }
    if (!validators || !validators.length) {
        throw new Error("At least one validator is required");
    }
    var errorAccumulator = new error_accumulator_1.default();
    var validationContext = new validation_context_1.default("", errorAccumulator);
    var result = validators.reduce(function (val, validator) { return validator.run(val, validationContext, val, val) || value; }, value);
    var errors = errorAccumulator.errors();
    if (Object.keys(errors).length) {
        return {
            valid: false,
            value: null,
            errors: errors
        };
    }
    return {
        valid: true,
        value: result
    };
}
exports.validate = validate;
//# sourceMappingURL=index.js.map