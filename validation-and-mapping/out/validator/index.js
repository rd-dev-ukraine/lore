"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
/// <reference path="./validator.d.ts" />
var error_accumulator_1 = require("./error-accumulator");
var validation_context_1 = require("./validation-context");
__export(require("./rules"));
function validate(value, validator) {
    var errorAccumulator = new error_accumulator_1.default();
    var validationContext = new validation_context_1.default("", errorAccumulator);
    var result = validator.run(value, validationContext, value, value);
    var errors = errorAccumulator.errors();
    if (Object.keys(errors).length) {
        return {
            valid: false,
            value: result,
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