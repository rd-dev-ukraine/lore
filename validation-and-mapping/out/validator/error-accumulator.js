"use strict";
var ErrorAccumulator = (function () {
    function ErrorAccumulator() {
        this.errorHash = {};
        this.isValid = false;
    }
    ErrorAccumulator.prototype.report = function (path, errorMessage) {
        if (!errorMessage) {
            return;
        }
        var messages = this.errorHash[path] = (this.errorHash[path] || []);
        messages.push(errorMessage);
        this.isValid = false;
    };
    ErrorAccumulator.prototype.errors = function () {
        return this.errorHash;
    };
    ErrorAccumulator.prototype.valid = function () {
        return this.isValid;
    };
    return ErrorAccumulator;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ErrorAccumulator;
//# sourceMappingURL=error-accumulator.js.map