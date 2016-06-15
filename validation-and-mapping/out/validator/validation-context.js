/// <reference path="./validator.d.ts" />
"use strict";
var ValidationContext = (function () {
    function ValidationContext(path, errorAccumulator) {
        this.path = path;
        this.errorAccumulator = errorAccumulator;
    }
    ValidationContext.prototype.reportError = function (message) {
        this.errorAccumulator
            .report(this.path, message);
    };
    ValidationContext.prototype.property = function (propertyName) {
        return this.nest(propertyName);
    };
    ValidationContext.prototype.index = function (index) {
        return this.nest("[" + index + "]");
    };
    ValidationContext.prototype.nest = function (path) {
        if (!path) {
            throw new Error("path is undefined");
        }
        var fullPath = path;
        if (this.path) {
            fullPath = path[0] === "[" ? this.path + path : this.path + "." + path;
        }
        return new ValidationContext(fullPath, this.errorAccumulator);
    };
    return ValidationContext;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ValidationContext;
//# sourceMappingURL=validation-context.js.map