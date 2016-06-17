/// <reference path="./validator.d.ts" />
"use strict";
var ValidationContext = (function () {
    function ValidationContext(path, errorAccumulator, errorCallback) {
        if (errorCallback === void 0) { errorCallback = null; }
        this.path = path;
        this.errorAccumulator = errorAccumulator;
        this.errorCallback = errorCallback;
    }
    ValidationContext.prototype.reportError = function (message) {
        if (this.errorCallback && !this.errorCallback(message)) {
            return;
        }
        this.errorAccumulator
            .report(this.path, message);
    };
    ValidationContext.prototype.property = function (propertyName, errorCallback) {
        return this.nest(propertyName, errorCallback);
    };
    ValidationContext.prototype.index = function (index, errorCallback) {
        return this.nest("[" + index + "]", errorCallback);
    };
    ValidationContext.prototype.nest = function (path, errorCallback) {
        if (!path) {
            throw new Error("path is undefined");
        }
        var fullPath = path;
        if (this.path) {
            fullPath = path[0] === "[" ? this.path + path : this.path + "." + path;
        }
        return new ValidationContext(fullPath, this.errorAccumulator, errorCallback);
    };
    return ValidationContext;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ValidationContext;
//# sourceMappingURL=validation-context.js.map