/// <reference path="./validator.d.ts" />
"use strict";
var ValidationContext = (function () {
    function ValidationContext(valueToValidate, path, errorAccumulator) {
        this.valueToValidate = valueToValidate;
        this.path = path;
        this.errorAccumulator = errorAccumulator;
    }
    return ValidationContext;
}());
exports.ValidationContext = ValidationContext;
//# sourceMappingURL=validation-context.js.map