/// <reference path="./validator.d.ts" />
"use strict";
var ErrorAccumulator = (function () {
    function ErrorAccumulator() {
        this.errorHash = {};
    }
    ErrorAccumulator.prototype.report = function (path, errorMessage) {
        if (!errorMessage) {
            return;
        }
        var messages = this.errorHash[path] = (this.errorHash[path] || []);
        messages.push(errorMessage);
    };
    ErrorAccumulator.prototype.errors = function () {
        return this.errorHash;
    };
    return ErrorAccumulator;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ErrorAccumulator;
//# sourceMappingURL=error-accumulator.js.map