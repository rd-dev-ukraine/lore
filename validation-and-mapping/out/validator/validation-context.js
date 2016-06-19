"use strict";
var error_accumulator_1 = require("./error-accumulator");
var ValidationContext = (function () {
    function ValidationContext(path, errorAccumulator, errorCallback) {
        if (errorCallback === void 0) { errorCallback = null; }
        this.path = path;
        this.errorAccumulator = errorAccumulator;
        this.errorCallback = errorCallback;
        this.errorBuffer = null;
    }
    ValidationContext.prototype.reportError = function (message) {
        if (this.errorCallback && !this.errorCallback(message)) {
            return;
        }
        (this.errorBuffer || this.errorAccumulator).report(this.path, message);
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
    ValidationContext.prototype.bufferErrors = function () {
        var result = new ValidationContext(this.path, this.errorAccumulator, this.errorCallback);
        result.errorBuffer = new error_accumulator_1.default();
        return result;
    };
    ValidationContext.prototype.flushErrors = function () {
        var _this = this;
        if (this.errorBuffer) {
            var errors_1 = this.errorBuffer.errors();
            Object.keys(errors_1)
                .forEach(function (path) {
                var messages = errors_1[path];
                messages.forEach(function (message) { return _this.errorAccumulator.report(path, message); });
            });
        }
        this.errorBuffer = null;
    };
    return ValidationContext;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ValidationContext;
//# sourceMappingURL=validation-context.js.map